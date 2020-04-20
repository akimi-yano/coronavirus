/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

package coronavirus;

import java.util.*;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;

import java.io.*;
import java.nio.file.*;
import java.util.stream.*;
import org.apache.commons.lang3.exception.*;
import org.jpmml.evaluator.*;
import org.dmg.pmml.FieldName;

/**
 * Azure Functions with HTTP Trigger.
 */
public class Function {
    /**
     * This function listens at endpoint "/api/HttpTrigger-Java". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/HttpTrigger-Java&code={your function key}
     * 2. curl "{your host}/api/HttpTrigger-Java?name=HTTP%20Query&code={your function key}"
     * Function Key is not needed when running locally, it is used to invoke function deployed to Azure.
     * More details: https://aka.ms/functions_authorization_keys
     */
    @FunctionName("predict")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {HttpMethod.GET, HttpMethod.POST}, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");

        // params
        String ago = request.getQueryParameters().get("ago");
        String country = request.getQueryParameters().get("country");
        String province = request.getQueryParameters().get("province");
        if (ago == null || country == null || province == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass params").build();
        } 

        try {
            evaluate(context, ago, country, province);
        } catch (Exception e) {
            context.getLogger().warning(ExceptionUtils.getStackTrace(e));
        }

        return request.createResponseBuilder(HttpStatus.OK).body("Hello").build();
    }

    public void evaluate(ExecutionContext context,
    String ago, String country, String province) throws Exception {
        Evaluator evaluator = new LoadingModelEvaluatorBuilder()
        .load(new File(getModelPath(ago)))
        .build();
        context.getLogger().info(evaluator.toString());

        // Perforing the self-check
        evaluator.verify();

        // Printing input (x1, x2, .., xn) fields
        List<? extends InputField> inputFields = evaluator.getInputFields();
        System.out.println("Input fields: " + inputFields);

        // Printing primary result (y) field(s)
        List<? extends TargetField> targetFields = evaluator.getTargetFields();
        System.out.println("Target field(s): " + targetFields);

        // Printing secondary result (eg. probability(y), decision(y)) fields
        List<? extends OutputField> outputFields = evaluator.getOutputFields();
        System.out.println("Output fields: " + outputFields);

        // Iterating through columnar data (eg. a CSV file, an SQL result set)
        while(true){
            // Reading a record from the data source
            Map<FieldName, ?> inputRecord = readRecord(context, ago, country, province);
            if(inputRecord == null){
                break;
            }

            Map<FieldName, FieldValue> arguments = new LinkedHashMap<>();

            // Mapping the record field-by-field from data source schema to PMML schema
            for(InputField inputField : inputFields){
                FieldName inputName = inputField.getName();

                Object rawValue = inputRecord.get(inputName.getValue());

                // Transforming an arbitrary user-supplied value to a known-good PMML value
                FieldValue inputValue = inputField.prepare(rawValue);

                arguments.put(inputName, inputValue);
            }

            // Evaluating the model with known-good arguments
            Map<FieldName, ?> results = evaluator.evaluate(arguments);

            // Decoupling results from the JPMML-Evaluator runtime environment
            Map<String, ?> resultRecord = EvaluatorUtil.decodeAll(results);

            // Writing a record to the data sink
            writeRecord(context, resultRecord);

            // TODO remove
            break;
        }

        // Making the model evaluator eligible for garbage collection
        evaluator = null;
    }

    // TODO
    public Map<FieldName, ?> readRecord(ExecutionContext context, String ago, String country, String province) throws Exception {
        File file = new File(getTestPath(ago));
        InputStream is = new FileInputStream(file);
        CsvUtil.Table inputTable = CsvUtil.readTable(is, ";");
        List<String> missingValues = Arrays.asList("N/A", "NA");
        List<? extends Map<FieldName, ?>> inputRecords = BatchUtil.parseRecords(inputTable, createCellParser(!missingValues.isEmpty() ? new HashSet<>(missingValues) : null));
        
        context.getLogger().warning(inputRecords.get(0).toString());
        context.getLogger().warning(inputRecords.get(0).get(FieldName.create("lat")).toString());

        Map<FieldName, ?> rec = inputRecords.stream().filter(record ->
        record.get(FieldName.create("Province_State")).equals(province) && record.get(FieldName.create("Country_Region")).equals(country))
        .findFirst().get();
        rec.remove(FieldName.create("Province_State"));
        rec.remove(FieldName.create("Country_Region"));
        return rec;
    }

    // TODO
    public void writeRecord(ExecutionContext context, Map<String, ?> resultRecord) {
        context.getLogger().warning("result: " + resultRecord.toString());
    }

    public String getModelPath(String ago) throws Exception {
        String model = "confirmed_model_" + ago + ".pmml";
        // get model path
        String binPath =
        new File(Function.class.getProtectionDomain().getCodeSource().getLocation()
        .toURI()).getPath();
        binPath = Paths.get(binPath).getParent().toString();
        return Paths.get(binPath, "models", "confirmed", model).toString();
    }

    public String getTestPath(String ago) throws Exception {
        String test = "test_model_" + ago + ".csv";
        // get model path
        String binPath =
        new File(Function.class.getProtectionDomain().getCodeSource().getLocation()
        .toURI()).getPath();
        binPath = Paths.get(binPath).getParent().toString();
        return Paths.get(binPath, "models", "test", test).toString();
    }

    // pulled from pmml-evaluator-example Example as it is not available on maven
    static
    public java.util.function.Function<String, String> createCellParser(Collection<String> missingValues){
        java.util.function.Function<String, String> function = new java.util.function.Function<String, String>(){

            @Override
            public String apply(String string){

                if(missingValues != null && missingValues.contains(string)){
                    return null;
                }

                // Remove leading and trailing quotation marks
                string = stripQuotes(string, '\"');
                string = stripQuotes(string, '\"');

                // Standardize European-style decimal marks (',') to US-style decimal marks ('.')
                if(string.indexOf(',') > -1){
                    String usString = string.replace(',', '.');

                    try {
                        Double.parseDouble(usString);

                        string = usString;
                    } catch(NumberFormatException nfe){
                        // Ignored
                    }
                }

                return string;
            }

            private String stripQuotes(String string, char quoteChar){

                if(string.length() > 1 && ((string.charAt(0) == quoteChar) && (string.charAt(string.length() - 1) == quoteChar))){
                    return string.substring(1, string.length() - 1);
                }

                return string;
            }
        };

        return function;
    }
}
