import ServiceConfig from "../models/serviceConfig.model.js";
import asyncWrapper from "../middlewares/asyncWrapper.js";
import logger from "../config/logger.js";

export const createServiceConfig = asyncWrapper(
    async (req, res) => {
        const { serviceName, config } = req.validatedData.body;
        const existingConfig = await ServiceConfig.findOne({ serviceName });
        if (existingConfig) {
            return res.status(409).json({
                success: false,
                message: "Service configuration already exists"
            });
        }
        const newConfig = await ServiceConfig.create({ serviceName, config });
        logger.info(`Service configuration created for ${serviceName}`);
        return res.status(201).json({   
            success: true,
            data: newConfig
        });
    }); 