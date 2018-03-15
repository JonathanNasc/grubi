import { createConnection, Connection, Query } from 'mysql';

export class Grubi {

    private static connection: Connection;
    
    public static async connect(uri: string) {
        return new Promise((resolve, reject) => {
            let db = createConnection(uri);
            db.connect((error) => {
                if (error) return reject(error);
                
                Grubi.connection = db;
                return resolve(db);
            });
        });       
    }

    public static async execute(query: String, params?: Array<any>): Promise<any> {
        if (!Grubi.connection) {
            throw new Error("The connection was not initialized");
        }

        return new Promise((resolve, reject) => {
            let sql = <Query> {sql: query, values: params};

            Grubi.connection.query(sql, (error, results, fields) => {
                if (error) return reject(error);

                return resolve(results);
            });
        })
    }
}
