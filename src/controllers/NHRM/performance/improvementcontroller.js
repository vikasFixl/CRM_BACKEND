import ImprovementPlan from "../../../models/NHRM/PerformanceManagement/improvementPlans.js";

export const createImprovementPlan=async(req,res)=>{
    try {
        
    } catch (error) {
        console.log("internal service error")
        res.status(500).json({error})
    }
}