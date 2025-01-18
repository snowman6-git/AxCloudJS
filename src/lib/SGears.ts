import { v4 as uuidv4 } from 'uuid';
import path  from 'path';

export function print(text: any){
  console.log(text)
}

export function uuid_gen(){
  const uuid = uuidv4();
  return uuid
}

export function html(filename: string){ //차후 뭐든지 파일이면 가능하게 클래스로 만들기
  const root = path.join("./src/htmls/", filename);
  return root
}

// 지금 오류있음 별걸 다 거르는 오류 검사하고 고치기
export function no_empty(...args: string[]): boolean {
  const regex = /[\s]/ // [공백문자나 SQLWORDS] *존재한다면 ;'"/%&|<>-sql구문은 차차 추가
  return !args.some((arg) => regex.test(arg)); // 문자가 있더라도 공백이 포함되면 false !를 추가하여 있으면 true인것을 뒤집음
}