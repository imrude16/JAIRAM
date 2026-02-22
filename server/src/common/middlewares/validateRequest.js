import { AppError } from "../errors/AppError.js";

const validateRequest = (schemas) => (req, res, next) => {
    try {
        console.log("🟨 [VALIDATE] Validation started"); // debugger

        const fieldsToValidate = ["body", "params", "query"];

        let validationErrors = [];

        for (const field of fieldsToValidate) {
            if (schemas[field]) {
                console.log(`🟨 [VALIDATE] Validating ${field}...`); // debugger

                const { error, value } = schemas[field].validate(req[field], {
                    abortEarly: false,
                    stripUnknown: true,
                });
                /* --> .validate(...) returns the below object that has been destructed at line no. 15 and used , comes from JOI validation library
                    {
                         value: validatedAndPossiblyTransformedData,
                         error: ValidationErrorObject | undefined
                    }

                     // ***FIRST COMES THIS OBJECT STRUCTURE FROM JOI VALIDATION LIBRARY***
                    result = {
                       value: ...,   // validated/sanitized data
                       error: ...    // ValidationError object (if validation failed)
                    }
                    // ***THEN ERROR OBJECT STRUCTURE (IF VALIDATION FAILS) LOOKS LIKE THIS***
                    error = {
                       _original: { name: "A", age: 15 },
                       details: [ ... ]
                    }
                */
                if (error) {
                    console.log(`❌ [VALIDATE] ${field} validation FAILED:`, error.details); // debugger
                    validationErrors.push(
                        ...error.details.map((err) => ({
                            field: field,
                            message: err.message,
                            path: err.path.join("."),
                        }))
                    );
                /*   --> .details(...) is an array of error details provided by JOI when validation fails
                    details: [{
                         message: '"name" length must be at least 3 characters long',
                         path: ['name'],
                         type: 'string.min',
                         context: {...}
                    }]
                */
                } else {
                    console.log(`✅ [VALIDATE] ${field} validation PASSED`); // debugger

                    // For query params, we need to handle differently
                    // because req.query is read-only in Express
                    if (field === 'query') {
                        // Merge validated values back into query
                        Object.keys(value).forEach(key => {
                            req.query[key] = value[key];
                        });
                    } else {
                        // For body and params, direct assignment works
                        req[field] = value;
                    }
                    /*
                    req.query = value; ---> You are changing the reference. This is not allowed because req.query is read-only in Express.
                    Instead, we need to copy the validated values back into req.query without changing its reference.

                    req.query[key] = value[key]; ---> You are modifying the existing object. 
                    This is allowed and works correctly because you are not changing the reference of req.query, just updating its properties.
                    */
                }
            }
        }

        if (validationErrors.length > 0) {
            console.log("❌ [VALIDATE] Validation failed with errors:", validationErrors); // debugger
            return next(
                new AppError(
                    "Validation Failed",
                    400,
                    "VALIDATION_ERROR",
                    { errors: validationErrors }
                )
            );
        }

        console.log("✅ [VALIDATE] All validation passed!"); // debugger
        next();
    } catch (error) {
        console.error("❌ [VALIDATE] Exception caught:", error); // debugger
        next(error);
    }
};

export { validateRequest };