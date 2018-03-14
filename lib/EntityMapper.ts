import { ActiveRecord } from './ActiveRecord';

export interface EntityMapper {
    
    /**
    * Entity name
    */
    table: string;

    /**
    * An array with the relation 
    * of the column name and the model property
    */
    fields: Array<{column: string, property: string, type?: string}>;

    /**
     * The class of model
     */
    createNewInstance(): any;

    /**
     * The validation that will be runned before save
     */
    validate(model: ActiveRecord): void;

}