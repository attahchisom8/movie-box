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


export interface StreamEngineErrorProperties {
	code: StreamErrorCode;
	devMessage: string;
	userFriendlyMessage: string;
	originalError: unknown;
	type: StreamEngineErrorTypes;

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

	constructor(props: StreamEngineErrorProperties) {
		super(props.devMessage);
		this.name = "StreamEngineError";
		this.code = props.code;
		this.userFriendlyMessage = props.userFriendlyMessage;
		this.originalError = props.originalError;
		this.type = props.type;
	}
}

export interface ManagedErrorResult {
	code: StreamErrorCode;
	usrMessage: string;
	engineError: StreamEngineError;
}

