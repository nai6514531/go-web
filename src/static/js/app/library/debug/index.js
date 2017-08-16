import moment from 'moment'
import querystring from 'querystring'

export const env = window.__ENV__ = __ENV__
const qs = querystring.parse(window.location.search.slice(1))

export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
}

export const isProduction = env.ENV === ENVIRONMENT.PRODUCTION
export const isStaging = env.ENV === ENVIRONMENT.STAGING
export const isDevelopment = env.ENV === ENVIRONMENT.DEVELOPMENT

export const isDebug = isDevelopment || ('debug' in qs)

if (isDebug) {
  console.log(
  `-----===== ${env.PKG_NAME} =====-----

  [包名] ${env.PKG_NAME}
  [编译环境] ${env.ENV || '无'}
  [最近编译时间] ${moment(env.BUILT_AT).format('YYYY-MM-DD HH:mm:ss')}

  .....----- ${env.PKG_NAME.replace(/./g, '=')} -----.....
  `)

}
