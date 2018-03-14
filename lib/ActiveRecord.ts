import { EntityMapper } from './EntityMapper';
import { DB } from './DB';

export abstract class ActiveRecord {

    private id: number;
    private createdAt: Date;
    private updatedAt: Date;
    protected mapper: EntityMapper;

    constructor(mapper: EntityMapper) {
        this.mapper = mapper;
    }

    public getId(): number {
        return this.id;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }

    public getUpdatedAt(): Date {
        return this.updatedAt;
    }

    public async save(): Promise<void>  {
        this.mapper.validate(this);
        if (this.getId()) {
            return await this.update();
        } else {
            return await this.insert();
        }
    }

    protected static async select(mapper: EntityMapper, sql: string, params: any[]): Promise<any[]> {
        try {
            let results = await DB.execute(sql, params);
            let records: ActiveRecord[] = [];
            for (let resultSet of results) {
                records.push(ActiveRecord.resultSetToObject(mapper, resultSet));
            }
            return records;
        } catch (error) {
            throw error;
        }
    }

    protected static async selectWhere(mapper: EntityMapper, where: string, params: any[]): Promise<any[]> {
        let query = `SELECT * FROM ${mapper.table} WHERE ${where}`;
        return await ActiveRecord.select(mapper, query, params);
    }

    protected static async selectById(mapper: EntityMapper, id: number): Promise<any> {
        let query = `SELECT * FROM ${mapper.table} WHERE id = ?`;
        let records = await ActiveRecord.select(mapper, query, [id]);
        return records && records.length > 0 ? records[0] : null;
    }

    private async insert(): Promise<void> {
        let query = `INSERT INTO ${this.mapper.table} SET ?`;
        let params: any = this.getSetOfFields();
        try {
            let result = await DB.execute(query, params);
            this.id = result.insertId;
        } catch (error) {
            throw error;
        }
    }

    private async update(): Promise<void> {
        let query = `UPDATE ${this.mapper.table} SET ${this.getColumnsSet()} WHERE id = ?`;
        let params: Array<any> = this.getValues();
        params.push(this.getId());
        try {
            return await DB.execute(query, params);
        } catch (error) {
            throw error;
        }
    }

    private getColumnsSet(): string {
        let setOfFields = this.getSetOfFields();
        let countFields = 1;
        let fieldsLength = Object.keys(setOfFields).length;
        let columnsSet = "updated_at = ?, ";

        for (let column in setOfFields) {
            columnsSet += `${column} = ?`;
            if (countFields != fieldsLength) {
                columnsSet += ", "
            }
            countFields ++;
        }

        return columnsSet;
    }

    private getSetOfFields(): { [key: string]: string } {
        let setOfFields: { [key: string]: string } = {};
        for (let field of this.mapper.fields) {
            let value: any = (<any>this)[field.property];
            if (field.type == 'boolean')
                value = value ? 1 : 0;

            setOfFields[field.column] = value;
        }

        return setOfFields;
    }

    private static resultSetToObject(mapper: EntityMapper, resultSet: any) {
        let o:any = mapper.createNewInstance();
        o.id = resultSet['id'];
        o.createdAt = resultSet['created_at'];
        o.updatedAt = resultSet['updated_at'];

        for (let field of mapper.fields) {
            let value = resultSet[field.column];
            if (field.type == 'boolean')
                value = value == 1 ? true : false;

            o[field.property] = value;
        }

        return o;
    }

    private getValues(): Array<any> {
        let values = [];
        let setOfFields = this.getSetOfFields();
        values.push(new Date);

        for (let column in setOfFields) {
            values.push(setOfFields[column]);
        }

        return values;
    }

}