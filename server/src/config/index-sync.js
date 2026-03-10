export const syncModelIndexes = async (model, modelName) => {
    try {
        await model.collection.dropIndexes();
        await model.syncIndexes();
        console.log(`✅ [INDEX-SYNC] ${modelName} indexes rebuilt`);
    } catch (error) {
        if (error.message.includes('ns not found')) {
            console.log(`📝 [INDEX-SYNC] ${modelName} collection is empty`);
        } else {
            console.error(`⚠️ [INDEX-SYNC] ${modelName}:`, error.message);
        }
    }
};