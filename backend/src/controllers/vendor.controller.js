import Vendor from "../models/Vendor.js";
import Payment from "../models/Payment.js";
import { col } from "sequelize";

const FRONTEND_URL = "https://thenexuspay.com";


const RESERVED_SLUGS = [
    "api",
    "admin",
    "login",
    "payment",
    "success",
    "failed",
    "cancelled",
    "favicon",
];


const createSlug = (value) => {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
};


export const createVendor = async (req, res) => {

    try {

        const { companyName, slug } = req.body;


        if (!companyName) {
            return res.status(400).json({
                success: false,
                message: "Company name is required",
            });

        }


        const finalSlug = slug ? createSlug(slug) : createSlug(companyName);


        if (!finalSlug) {
            return res.status(400).json({
                success: false,
                message: "Valid slug is required",
            });

        }


        if (RESERVED_SLUGS.includes(finalSlug)) {

            return res.status(400).json({
                success: false,
                message: "This slug is reserved and cannot be used",
            });

        }


        const existingVendor = await Vendor.findOne({
            where: {
                slug: finalSlug,
            },
        });


        if (existingVendor) {
            return res.status(409).json({
                success: false,
                message: "This payment link already exists",
            });

        }


        const vendor = await Vendor.create({
            companyName,
            slug: finalSlug,
            isActive: true,
            createdBy: req.admin?.id || null,
        });


        return res.status(201).json({
            success: true,
            message: "Vendor created successfully",
            data: {
                id: vendor.id,
                companyName: vendor.companyName,
                slug: vendor.slug,
                isActive: vendor.isActive,
                paymentUrl: `${FRONTEND_URL}/${vendor.slug}`,
            },

        });

    } catch (error) {
        console.error("Create vendor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const getVendors = async (req, res) => {

    try {

        const vendors = await Vendor.findAll({
            order: [["createdAt", "DESC"]],
        });


        const data = vendors.map((vendor) => {

            const item = vendor.toJSON();

            return {
                ...item,
                paymentUrl: `${FRONTEND_URL}/${item.slug}`,
            };

        });


        return res.status(200).json({
            success: true,
            data,
        });

    } catch (error) {
        console.error("Get vendors error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};


export const getVendor = async (req, res) => {

    try {

        const { id } = req.params;


        const vendor = await Vendor.findByPk(id);


        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });

        }


        return res.status(200).json({
            success: true,
            data: {
                ...vendor.toJSON(),
                paymentUrl: `${FRONTEND_URL}/${vendor.slug}`,
            },

        });

    } catch (error) {
        console.error("Get vendor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const getVendorBySlug = async (req, res) => {

    try {

        const { slug } = req.params;


        const vendor = await Vendor.findOne({

            where: {
                slug,
                isActive: true,
            },

            attributes: [
                "id",
                "companyName",
                "slug",
                "isActive",
            ],

        });


        if (!vendor) {

            return res.status(404).json({
                success: false,
                message: "Payment link not found",
            });

        }


        return res.status(200).json({
            success: true,
            data: vendor,
        });

    } catch (error) {
        console.error("Get vendor by slug error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const editVendor = async (req, res) => {

    try {

        const { id } = req.params;

        const { companyName, slug } = req.body;


        const vendor = await Vendor.findByPk(id);


        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });

        }

        if (companyName) {
            vendor.companyName = companyName;
        }


        if (slug) {
            const newSlug = createSlug(slug);
            if (RESERVED_SLUGS.includes(newSlug)) {
                return res.status(400).json({
                    success: false,
                    message: "This slug is reserved",
                });

            }


            const existing = await Vendor.findOne({
                where: {
                    slug: newSlug,
                },
            });


            if (existing && existing.id !== vendor.id) {
                return res.status(409).json({
                    success: false,
                    message: "This payment link already exists",
                });

            }


            vendor.slug = newSlug;

        }


        await vendor.save();


        return res.status(200).json({
            success: true,
            message: "Vendor updated successfully",
            data: {
                ...vendor.toJSON(),
                paymentUrl: `${FRONTEND_URL}/${vendor.slug}`,
            },

        });

    } catch (error) {
        console.error("Edit vendor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const activateVendor = async (req, res) => {

    try {

        const { id } = req.params;


        const vendor = await Vendor.findByPk(id);


        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });

        }


        vendor.isActive = true;

        await vendor.save();


        return res.status(200).json({
            success: true,
            message: "Vendor activated successfully",
            data: vendor,
        });

    } catch (error) {
        console.error("Activate vendor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const deactivateVendor = async (req, res) => {

    try {

        const { id } = req.params;

        const vendor = await Vendor.findByPk(id);


        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });

        }


        vendor.isActive = false;

        await vendor.save();


        return res.status(200).json({
            success: true,
            message: "Vendor deactivated successfully",
            data: vendor,
        });

    } catch (error) {
        console.error("Deactivate vendor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};

export const deleteVendor = async (req, res) => {

    try {

        const { id } = req.params;

        const vendor = await Vendor.findByPk(id);


        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });

        }


        const paymentCount = await Payment.count({
            where: {
                vendorId: vendor.id,
            },
        });


        if (paymentCount > 0) {

            return res.status(400).json({
                success: false,
                message: "Vendor cannot be permanently deleted because payments exist for this vendor. Deactivate the vendor instead.",
                data: {
                    paymentCount,
                },

            });

        }


        await vendor.destroy();


        return res.status(200).json({
            success: true,
            message: "Vendor deleted successfully",
        });

    } catch (error) {
        console.error("Delete vendor error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }

};


export const getVendorPayments = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findByPk(id);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });
        }

        const payments = await Payment.findAll({
            where: {
                vendorId: vendor.id,
            },

            order: [
                [col("created_at"), "DESC"],
            ],
        });

        return res.status(200).json({
            success: true,

            data: {
                vendor: {
                    id: vendor.id,
                    companyName: vendor.companyName,
                    slug: vendor.slug,
                    isActive: vendor.isActive,
                },

                payments,
            },
        });
    } catch (error) {
        console.error(
            "Get vendor payments error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};