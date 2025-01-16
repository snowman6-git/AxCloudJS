//import 할때 export 된 모든게 가능
//Hono ===============================
import { Hono } from 'hono'
import { //hono에서 쿠키 지원함
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'
//lib ==========================
import { Uchein } from '../lib/uchein' //유저와 세션의 체인
import { uuid_gen, print } from '../lib/SGears' //자주 쓰거나 간단하지만 줄차지하는 모듈/함수
//Npm ================================
import { CookieStore, Session, sessionMiddleware } from 'hono-sessions';

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

app.get('/', async (c, next) => {
  let uuid = uuid_gen()
  const session = c.get('session') //요청받은곳의 session을 감지
  session.set("user_id", "aa2") //세션을 ?로 설정. type SessionUsing을 따라야함
  session.set("usession_id", uuid)
  // session.set('counter', (session.get('counter') || 0) + 1) //세션의 좋은 예시(동일한 유저가 방문했는지 인식)
  return c.html(`환영합니다 ${ session.get('user_id') } ${ session.get('usession_id') } 를 보유중이네요!`)
})

// app.get('/', (c) => {
//   let uuid = uuid_gen()

//   setCookie(c, 'user_id', "aa2")
//   setCookie(c, 'usession_id', uuid)
//   return c.text("OK!")

// })

export default app
