import { AppDataSource } from "../src/config/data-source";

async function checkUuid() {
    try {
        await AppDataSource.initialize();
        const result = await AppDataSource.query("SELECT version()");
        console.log("Postgres Version:", result[0].version);
        
        try {
            const uuidTest = await AppDataSource.query("SELECT gen_random_uuid()");
            console.log("gen_random_uuid() works:", uuidTest);
        } catch (e: any) {
            console.log("gen_random_uuid() failed:", e.message);
        }

        try {
            const uuidTest2 = await AppDataSource.query("SELECT uuid_generate_v4()");
            console.log("uuid_generate_v4() works:", uuidTest2);
        } catch (e: any) {
            console.log("uuid_generate_v4() failed:", e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkUuid();
