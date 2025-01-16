export class Uchein {
    private _chein: String[]
    constructor() { //private를 초기화 시켜주기
        this._chein = [];
    }

    add_user(user: any, uuid: string){ //서버에서 직접 제공한 user의 session uuid를 저장
        this._chein[user] = uuid //키값 쌍 저장
    }
    is_real(user: any, client_uuid: string){ //프론트엔드에서 온 요청과 실제를 비교
        let server_uuid = this._chein[user]
        if (client_uuid === server_uuid){
            return true
        }
        else{return false}
    }
    view(){ //테스트용 테이블 뷰
    }
}