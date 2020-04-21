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
import  javax.json.*;
import org.apache.commons.lang3.exception.*;
import org.jpmml.evaluator.*;
import org.dmg.pmml.FieldName;

/**
 * Azure Functions with HTTP Trigger.
 */
public class Function {

    @FunctionName("locations")
    public HttpResponseMessage locations(
            @HttpTrigger(name = "req", methods = {HttpMethod.GET}, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");

        String locations = "{}";
        try {
            locations = getLocations(context);
        } catch (Exception e) {
            context.getLogger().warning(ExceptionUtils.getStackTrace(e));
        }

        return request.createResponseBuilder(HttpStatus.OK).body(locations).build();
    }

    /**
     * This function listens at endpoint "/api/HttpTrigger-Java". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/HttpTrigger-Java&code={your function key}
     * 2. curl "{your host}/api/HttpTrigger-Java?name=HTTP%20Query&code={your function key}"
     * Function Key is not needed when running locally, it is used to invoke function deployed to Azure.
     * More details: https://aka.ms/functions_authorization_keys
     */
    @FunctionName("predict")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {HttpMethod.GET}, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");

        // params
        String ago = request.getQueryParameters().get("ago");
        String country = request.getQueryParameters().get("country");
        String province = request.getQueryParameters().get("province");
        if (ago == null || country == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass params").build();
        }
        // empty provinces are allowed
        if (province == null) {
            province = "";
        }

        String body = "";
        try {
            body = evaluate(context, ago, country, province);
        } catch (Exception e) {
            context.getLogger().warning(ExceptionUtils.getStackTrace(e));
        }

        return request.createResponseBuilder(HttpStatus.OK).body(body).build();
    }

    public String getLocations(ExecutionContext context) throws Exception {
        File file = new File(getTestPath("1"));
        InputStream is = new FileInputStream(file);
        CsvUtil.Table inputTable = CsvUtil.readTable(is, ";");
        List<String> missingValues = Arrays.asList("N/A", "NA");
        List<? extends Map<FieldName, ?>> inputRecords = BatchUtil.parseRecords(inputTable, createCellParser(!missingValues.isEmpty() ? new HashSet<>(missingValues) : null));

        // lookup record based on Country & Province
        Map<String, List<String>> locations = new HashMap();
        inputRecords.stream().forEach(record -> {
            String province = record.get(FieldName.create("Province_State")).toString();
            String country = record.get(FieldName.create("Country_Region")).toString();
            if (locations.containsKey(country)) {
                locations.get(country).add(province);
            } else {
                ArrayList<String> provinces = new ArrayList();
                provinces.add(province);
                locations.put(country, provinces);
            }
        });
        JsonArrayBuilder countries = Json.createArrayBuilder();
        for (Map.Entry<String,List<String>> entry : locations.entrySet()) {
            JsonArrayBuilder provincesBuilder = Json.createArrayBuilder();
            for (String province : entry.getValue()) {
                if (!"".equals(province)) {
                    provincesBuilder = provincesBuilder.add(
                        Json.createObjectBuilder().add("name", province));
                }
            }
            JsonObjectBuilder countryBuilder = Json.createObjectBuilder()
            .add("name", entry.getKey())
            .add("provinces", provincesBuilder);
            countries.add(countryBuilder);
        }

        return Json.createObjectBuilder().add("countries", countries).build().toString();
    }

    public String evaluate(ExecutionContext context,
    String ago, String country, String province) throws Exception {
        // Reading a record from the data source
        Map<FieldName, ?> inputRecord = readRecord(context, ago, country, province);

        List<String> toPredicts  = new ArrayList();
        JsonObjectBuilder jsonBuilder = Json.createObjectBuilder();
        toPredicts.add("confirmed");
        toPredicts.add("fatalities");
        for (String toPredict : toPredicts) {
            String fieldName = toPredict + "_" + ago + "_ago";
            Double startValue = Double.parseDouble(inputRecord.get(FieldName.create(fieldName)).toString());
            Evaluator evaluator = new LoadingModelEvaluatorBuilder()
            .load(new File(getModelPath(ago, toPredict)))
            .build();
            // Perforing the self-check
            evaluator.verify();

            // Printing input (x1, x2, .., xn) fields
            List<? extends InputField> inputFields = evaluator.getInputFields();

            Map<FieldName, FieldValue> arguments = new LinkedHashMap<>();

            // Mapping the record field-by-field from data source schema to PMML schema
            for(InputField inputField : inputFields){
                FieldName inputName = inputField.getName();

                Object rawValue = inputRecord.get(inputName);

                // Transforming an arbitrary user-supplied value to a known-good PMML value
                FieldValue inputValue = null;
                try {
                    inputValue = inputField.prepare(rawValue);
                } catch(Exception e) {
                    context.getLogger()
                    .warning("can't parse value for field '" + inputName.toString() + "': " + rawValue.toString());
                }

                arguments.put(inputName, inputValue);
            }

            // Evaluating the model with known-good arguments
            Map<FieldName, ?> results = evaluator.evaluate(arguments);

            // Decoupling results from the JPMML-Evaluator runtime environment
            Map<String, ?> resultRecord = EvaluatorUtil.decodeAll(results);

            // Writing a record to the data sink
            String value = writeRecord(context, resultRecord, toPredict, startValue);
            jsonBuilder.add(toPredict, value);
        }

        return jsonBuilder.build().toString();
    }

    // TODO
    public Map<FieldName, ?> readRecord(ExecutionContext context, String ago, String country, String province) throws Exception {
        File file = new File(getTestPath(ago));
        InputStream is = new FileInputStream(file);
        CsvUtil.Table inputTable = CsvUtil.readTable(is, ";");
        List<String> missingValues = Arrays.asList("N/A", "NA");
        List<? extends Map<FieldName, ?>> inputRecords = BatchUtil.parseRecords(inputTable, createCellParser(!missingValues.isEmpty() ? new HashSet<>(missingValues) : null));

        // lookup record based on Country & Province
        Map<FieldName, ?> rec = inputRecords.stream().filter(record ->
        record.get(FieldName.create("Province_State")).equals(province) && record.get(FieldName.create("Country_Region")).equals(country))
        .findFirst().get();

        // remove extra columns that prediction can't handle
        rec.remove(FieldName.create("Province_State"));
        rec.remove(FieldName.create("Country_Region"));
        return rec;
    }

    // TODO
    public String writeRecord(ExecutionContext context, Map<String, ?> resultRecord, String toPredict, Double startValue) {
        Double logDiff = Double.parseDouble(resultRecord.get("_target").toString());
        Double prediction = Math.exp(logDiff) + startValue;
        context.getLogger().warning(toPredict + " Prediction: " + prediction.toString());
        return prediction.toString();
    }

    public String getModelPath(String ago, String toPredict) throws Exception {
        String model = toPredict + "_model_" + ago + ".pmml";
        // get model path
        String binPath =
        new File(Function.class.getProtectionDomain().getCodeSource().getLocation()
        .toURI()).getPath();
        binPath = Paths.get(binPath).getParent().toString();
        return Paths.get(binPath, "models", toPredict, model).toString();
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
