//import 할때 export 된 모든게 가능
//Hono ======================================================================================
import { Hono } from 'hono'
import { //hono에서 쿠키 지원함
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
import { createBunWebSocket } from 'hono/bun'
import { file, type ServerWebSocket } from 'bun'
//lib =========================================================================================
import { Uchein } from './lib/uchein' //유저와 세션의 체인
import { uuid_gen, print, no_empty, html } from './lib/SGears' //자주 쓰거나 간단하지만 줄차지하는 모듈/함수
//Npm =======================================================================================
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions';
import { readFile } from 'fs/promises';
import fs from 'fs';

const uchein = new Uchein()
const store = new CookieStore()
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

type SessionUsing = { //해당 포맷의 세션만 리턴가능
  user_id: string;
  usession_id: string;
  // roles: string[];
};

const app = new Hono<{
  Variables: {
    session: Session<SessionUsing>,
    session_key_rotation: boolean
  }
}>() //<- 요건 여전히 뭔지 모르겠음

app.use('*', sessionMiddleware({
  store,
  encryptionKey: 'password_at_least_32_characters_long', //개발 단계에선 제외
  expireAfterSeconds: 900,
  cookieOptions: {
    sameSite: 'Lax',
    path: '/',
    httpOnly: true,
  },
}))

app.get( //실제로 할땐 wss 해서 인증서박기
  '/', //기본 주소를 동반한 라우팅 localhost:port/ws
  upgradeWebSocket((c) => {
    // const session = c.get('session')
    // if(uchein.who_is(session.get("usession_id"))){}
    return {
      async onMessage(event: any, ws: any, req: any) {
        let a = JSON.parse(event.data)
        const filename = ws.url['searchParams'].get("id")
        print(a)

        if(event.data === "end"){ //이걸 이딴식으로 해도 되는지 찾아오기
          print("파일 전송 완료됌!") //하드밀림이나 실제 저장이 완료되면
          // `./Files/${a["chunk_num"]}_${filename}_part`
          
          //  ws.send("저장완료!") //대충 머 보내주고 닫기
          ws.close()
        }
        
        await fs.promises.writeFile(`./Files/${a["chunk_num"]}_${filename}_part`, a["chunk"]); //나중에 경로관련 라이브러리 만들기
        //청크 단위만큼 파일명 바꿔서 저장해뒀다 막판에 함치기 > 중간에 유실된게 있으면 유실된거만 요청 가능해짐 + 이름중첩문제 해결
      },

      // socket.on('message', (message: any) => {
      //   const data = JSON.parse(message);
      //   console.log(`Received from ${socket.id}: ${data.message}`);
        
      //   // 클라이언트에게 응답 전송 (예: 확인 메시지)
      //   socket.send(`Received your message: ${data.message}`);
      // });
      onOpen: (socket: any, req: any) => {
        let filename = req.url['searchParams'].get("id") //["searchParams"].get()
        print(`새 연결이 생겼습니다! ${filename}`)
      },
      // onClose: () => {console.log('Connection closed')},

    }
  })
)

app.get('/', async(c) => {
  const file = Bun.file(html("index.html"));
  return new Response(file);
  // const session = c.get('session')
  // let usession_id = session.get('usession_id')
  // let user = uchein.who_is(usession_id)
  // return c.html(`${usession_id} ${user}`)
})

app.get('/login', (c) => {
  return c.html(`
    <form method="POST" action="/login">
      <input type="text" name="id" placeholder="Username">
      <input type="password" name="pw" placeholder="Password">
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', async (c) => {
  const formData = await c.req.formData() // 폼 데이터 파싱
  let id = formData.get("id")?.toString() || "" //예외처리를 위해 없을시
  let pw = formData.get("pw")?.toString() || "" //예외처리를 위해 없을시
  print(`ID: ${id}/PW: ${pw}`)

  const session = c.get('session')
  
  if (no_empty(id, pw)){//db통과시 차후 디비코드 추가
    const argonHash = await Bun.password.hash(pw, {
      algorithm: 'argon2id',
      memoryCost: 4, //메모리 요구치
      timeCost: 3, //생성을 위한 횟수
    });

    let usession_id = uuid_gen() //uuid 발급
    uchein.add_user(id, usession_id) //로그인이 성공했다면 user가 소지하는 세션을 전송 (차후 조회는 session으로만)

    setCookie(c, 'usession_id', usession_id)
    session.set("usession_id", usession_id)
    
    return c.html(`환영합니다 ${ uchein.who_is(session.get('usession_id')) } ${ session.get('usession_id') } 를 보유중이네요!`)
  }
  else{
    return c.html(`저런! 쓰잘때기 없는 시도는 이미 예측했답니다.`)
  }
})


// app.get('/', (c) => {
//   let uuid = uuid_gen()

//   setCookie(c, 'user_id', "aa2")
//   setCookie(c, 'usession_id', uuid)
//   return c.text("OK!")

// })

// export default app
export default {
  fetch: app.fetch,
  websocket,
}