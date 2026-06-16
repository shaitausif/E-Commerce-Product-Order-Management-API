// This is the validate middleware responsible to centralize the error checking done by the `express-validator` `ValidationChains`.
//  * This checks if the request validation has errors.
//  * If yes then it structures them and throws an {@link ApiError} which forwards the error to the {@link errorHandler} middleware which throws a uniform response at a single place

import { validationResult } from "express-validator";
import { ApiError } from "../utils/apiError.js";

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = [];

    errors.array().forEach((err) => {
        if ("path" in err) {
            extractedErrors.push({ [err.path]: err.msg });
        } else {
            extractedErrors.push({ general: err.msg });
        }
    });

    return next(new ApiError(422, "Received data is not valid", extractedErrors));
};
