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

//lib =========================================================================================
import { Uchein } from './lib/uchein' //유저와 세션의 체인
import { uuid_gen, print, no_empty, html } from './lib/SGears' //자주 쓰거나 간단하지만 줄차지하는 모듈/함수

//Npm =======================================================================================
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions';

import { readFile } from 'fs/promises';

const uchein = new Uchein()
const store = new CookieStore()

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

Bun.serve({
  fetch(req, server) {}, // upgrade logic
  websocket: {
    message(ws, message) {
      print(`${ws.remoteAddress}로 부터: ${message}`)
    }, // a message is received
    open(ws) {
      print("소켓 열림!")
      print(ws)
    }, // a socket is opened
    close(ws, code, message) {
      print("소켓 닫힘")
      print(ws)
    }, // a socket is closed
    drain(ws) {}, // the socket is ready to receive more data
  },
});

const socket = new WebSocket("ws://localhost:8000");
socket.addEventListener("message", event => {
  console.log(event.data);
})

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

export default app
