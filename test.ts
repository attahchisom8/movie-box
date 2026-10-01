import { errorBase } from "@/engine/stream-engine/errorBase.section";
import { notDeepEqual } from "assert";

type T1 = (...args: any[]) => any;
export interface DebbounceInterface<M extends T1> {
	(...args: Parameters<M>): void;
	cancel: ()  => void;
}

const debounce = <T extends T1>(
	callBack: T,
	arg1?: number,
	arg2?: string
): DebbounceInterface<T> => {
	const myFunc = (...args: Parameters<T>): void => {callBack(...args) };
	myFunc.cancel = () => {console.log("Anything")};

	return myFunc;
};

// OR

so in simpler terms the 4 rules can be summarized as folloews

1. we use the Parameter<T> and ReturnType<T> to capture the arguments from the
parent func and pass it to the callback while ReturnType captures the return type
of the type passed to it
then in that light shoudnt the ReturnType<T> = any in this case?

// TypeScript infers T automatically when you pass a function to 'callback'
function execute<T extends (...args: any[]) => any>(callback: T, ...args: Parameters<T>): ReturnType<T> {
  return callback(...args);
}


2. callbacks should infer its types from where they are called rather than typesetting
each args and return type every singe time thet are called

3. its better to write out the types amd return types o the callback outside if
they are complicated then pass it to the oarent function at definintion or
write those straigght at parent definintion if they are simpler e.g 
parent<T extends (arg: number | string) => void>(callback: T){....}


4. Functions in js are objects so when typeseting it we ask if the the function
needs to be associated with METHODS. iff yes we use interace to typeset all method Neeeded
else we use the type diredtly in the callback

with this rule let consider a hypothetical situation in which we need a callback
that is passed to a parent func. this callback 
i. Accepts 3 args witrh types or interfaces that may or may not be the same 
ii. it return type is
	a) the same as what the pareent function returns
	b) different from what rhe parent functuin returns 
	c) returns a function 

iii. the parent signature is as follows 
				parent(someArg, callback) => someValue 

case i: we have callbackify(a: a, b: B, c: C)
case iii.1  T Which is what it passed to tje parent

so from rule 3 and 4
type CallBack<A, B, C, T> = 	(a: A, b: B, c: C) => T;
and hence rule
parent<A, B, C, T, G>(someArg: G, callback: CallBack<A, B, C, T>): T OR
ReturnType<CallBack> => {};

case ii.b
type CallBack<A, B, C, T> = 	(a: A, b: B, c: C) => T;
and hence 
parent<A, B, C, T, G, W>(someArg: G, callback: CallBack<A, B, C, T>): W => {}; 

case ii.c 
lets assume toe cases 
the return type of parent is from callback 

type CallBack<A, B, C, T> = 	(a: A, b: B, c: C) => T;
and hence rule
parent<A, B, C, T, G>(someArg: G, callback: CallBack<A, B, C, T>):
CallBack<A, B, C, T> => {};

assume the return type of callback is a function that is not the return type of
tne parent

type CallBack<A, B, C, T> = 	(a: A, b: B, c: C) => T;
type parentReturnType<W extends (...args: any[]) => any> =
(...args: Parameters<W>) => any;
type W = (...args: any[]) => any;
parent<A, B, C, T, G, W>(someArg: G, callback: CallBack<A, B, C, T>):
parentReturnType<W> => {};

let t: string = {}



this class is very ambigious export class StreamEngineError extends Error {
  constructor(
    public code: StreamErrorCode,
    message: string,
    public userFriendlyMessage: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "StreamEngineError";
  }

} beacause we deffined local constructor arument we didnt use save messge  making me tnink the code is a short hand cam u expamd it if am rignt 


MODIFIED ENGINE ERROR HANDLING
 The modification i made in engine error handling architecture is as follows 

1. The errorBase should only be called oncs in the main engine file 
2.all errors gemerated by stream engine must be classified intp types specific only to
the section of the engine that generatrd it 
3. Each section of the engine generates it own error instamce of stream Engine error 
4.error base uses this type to know what human readable message to outpuut 
5. so the quetion is what happens when we happem when we have a raw error that is not 
an instance of StreamEngineError wjat do we dp with It 
	a. create a human readable message with it? 
	b. just log it ?
	c. whats more ? 
	d. pehaps all combined 

feel ffree to modify my architecture if need be 
