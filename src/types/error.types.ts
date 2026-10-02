/** Eror schemas */


export enum StreamErrorCode {
	TIMEOUT = "STREAM_TIMEOUT",
	PROVIDER_FAILED = "PROVIDER_FAILED",
	CONFIG_READ_ERROR = "CONFIG_READ_ERROR",
	CONFIG_WRITE_ERROR = "CONFIG_WRITE_ERROR",
	NO_STREAM_FOUND = "NO_STREAM_FOUND",
	UNKNOWN = "UNKNOWN_STREAM_ERROR"
};

export type StreamEngineErrorTypes = "TIMEOUT_TYPE_ERROR" |
"PROVIDER_FAILED_TYPE_ERROR" | "CONFIG_READ_TYPE_ERROR" | "NO_STREAM_FOUND_TYPE_ERROR"
| "UNKNOWN_STREAM_TYPE_ERROR" | "CONFIG_WRITE_TYPE_ERROR";

export type ErrorLevel = "INFO" | "WARN" | "ERROR" | "SEVERE";


export interface StreamEngineErrorProperties {
	code: StreamErrorCode;
	devMessage: string;
	userFriendlyMessage: string;
	originalError: unknown;
	type: StreamEngineErrorTypes;
	level?: ErrorLevel;

}

export class StreamEngineError extends Error {
	/* Here we initialize the properties of this class, note the paremt class
	already has the property message SO super calls the parentconstructor with
	the argument cevMessage
	*/
	public code: StreamErrorCode;
	public userFriendlyMessage: string;
	public originalError: unknown;
	public type: StreamEngineErrorTypes;
	public level: ErrorLevel;

	constructor(props: StreamEngineErrorProperties) {
		super(props.devMessage);
		this.name = "StreamEngineError";
		this.code = props.code;
		this.userFriendlyMessage = props.userFriendlyMessage;
		this.originalError = props.originalError;
		this.type = props.type;
		this.level = props.level ?? "ERROR";
	}
}

export interface ManagedErrorResult {
	code: StreamErrorCode;
	usrMessage: string;
	engineError: StreamEngineError;
}

