export interface AirtableRecord {
	records: Record[];
	offset: string;
}

export interface Record {
	id: string;
	fields: Fields;
	createdTime: Date;
}

export interface Fields {
	name: string;
	message: string;
	amount: number;
}
