/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

package coronavirus;

import java.util.*;
import com.microsoft.azure.functions.annotation.*;
import com.microsoft.azure.functions.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.jpmml.evaluator.Evaluator;
import org.jpmml.evaluator.LoadingModelEvaluatorBuilder;

/**
 * Azure Functions with HTTP Trigger.
 */
public class Function {

    public Set<String> listFilesUsingFileWalk(String dir, int depth) throws IOException {
        try (Stream<Path> stream = Files.walk(Paths.get(dir), depth)) {
            return stream
            .filter(file -> !Files.isDirectory(file))
            // .map(Path::getFileName)
            .map(Path::toString)
            .collect(Collectors.toSet());
        }
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
            @HttpTrigger(name = "req", methods = {HttpMethod.GET, HttpMethod.POST}, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");

        try {
            // params
            /// yyyy-MM-dd aka SimpleDateFormat
            String ago = request.getQueryParameters().get("ago");
            String country = request.getQueryParameters().get("country");
            String province = request.getQueryParameters().get("province");

            String model = "confirmed_model_" + ago + ".pmml";

            // get model path
            String binPath = new File(Function.class.getProtectionDomain().getCodeSource().getLocation()
            .toURI()).getPath();
            binPath = Paths.get(binPath).getParent().toString();
            String modelPath = Paths.get(binPath, "models", model).toString();

            Evaluator evaluator = new LoadingModelEvaluatorBuilder()
            .load(new File(modelPath))
            .build();
            context.getLogger().info(evaluator.toString());
        } catch (Exception e) {
            context.getLogger().warning(e.toString());
        }

        // Parse query parameter
        String query = request.getQueryParameters().get("name");
        String name = request.getBody().orElse(query);

        if (name == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass a name on the query string or in the request body").build();
        } else {
            return request.createResponseBuilder(HttpStatus.OK).body("Hello, " + name).build();
        }
    }
}
