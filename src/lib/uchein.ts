export class Uchein {
    private _chein: Map<string, string> //차후에 클래스로 변환
    constructor() { //private를 초기화 시켜주기
        this._chein = new Map<string, string>()
    }
    add_user(user: any, uuid: any){ //서버에서 직접 제공한 user의 session uuid를 저장
        this._chein.set(uuid, user)
    }
    who_is(uuid: any){ //프론트엔드에서 온 요청과 실제를 비교
        let user = this._chein.get(uuid)   
        if(user){
            //로그 남기기
            return user
        } 
        else {return false}
    }
    view(){ //테스트용 테이블 뷰
        console.log(this._chein)
    }
}