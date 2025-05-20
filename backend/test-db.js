import sequelize from "./src/config/db";
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log("Connection successful");
    }
    catch (error) {
        console.error("Connection failed:", error);
    }
}
testConnection();
//# sourceMappingURL=test-db.js.map