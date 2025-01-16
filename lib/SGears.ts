import { v4 as uuidv4 } from 'uuid';

export function print(text: string){
    console.log(text)
}
export function uuid_gen(){
  const uuid = uuidv4();
  return uuid
}