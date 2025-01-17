import { v4 as uuidv4 } from 'uuid';

export function print(text: any){
    console.log(text)
}
export function uuid_gen(){
  const uuid = uuidv4();
  return uuid
}
export function no_empty(...args: string[]): boolean {
    const regex = /[\s]*/ // [공백문자나 빈문자가] *존재한다면
    return !args.some((arg) => regex.test(arg)); // 문자가 있더라도 공백이 포함되면 false !를 추가하여 있으면 true인것을 뒤집음
}