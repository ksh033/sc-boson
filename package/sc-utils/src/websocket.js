/* eslint-disable consistent-return */
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
/**
 * options{
 *   url:'socketUrl'
 *   headers:发送参数
 *   receives ：接收队列
 *   send:'重发队列'
 *   send_params:'重发队列参数'
 *   timeout:'“超时时间秒”'
 *   reConnectNum:'重连次数'
 *   resendNum:'重发次数'
 * }
 */
class StompWebSocket {
  /* websocket实例 */
  _socket = null

  _stompClient = null

  /* '#'为私有属性，外部不可调用 */
  _timer = null

  // 计时器
  // 参数
  _options = {
    url: '',
    headers: null,
    receives: '',
    send: '',
    sendParams: '',
    timeout: 30,
    reConnectNum: 3,
    resendNum: 3,
  }

  _msg = {
    200: '连接成功',
    '001': '重发次数超出',
    '002': '重连次数超出',
  }

  _reConnectNum = 0

  _resendNum = 0

  constructor(options) {
    this._options = { ...this._options, ...options }
    const { reConnectNum, resendNum, url } = this._options
    this._reConnectNum = reConnectNum
    this._resendNum = resendNum
    if (url) {
      this._socket = new SockJS(url)
    }
  }

  _clearTimeout() {
    clearTimeout(this._timer)
  }

  _resend(resolve, reject) {
    const that = this
    this._clearTimeout()
    const { send, sendParams, timeout } = this._options
    if (this._resendNum <= 0) {
      this.dispose()
      return reject({ code: '001', msg: this._msg['001'] })
    } else {
      this._resendNum--
    }
    that._timer = setTimeout(() => {
      try {
        this._stompClient.send(send, {}, sendParams)
        that._resend(resolve, reject)
      } catch (err) {
        console.log(`断线了: ${err}`)
        that._reconnect(resolve, reject, err)
      }
    }, timeout * 1000)
  }

  _reconnect(resolve, reject) {
    if (this._reConnectNum <= 0) {
      reject({ data: null, code: '002', msg: this._msg['002'] })
    } else {
      this._reConnectNum--
      this._stompClient.disconnect()
      this._stompClient = null
      this._connect(resolve, reject)
    }
  }

  _connect(resolve, reject) {
    const that = this
    const { receives, send, headers } = this._options
    this._stompClient = Stomp.over(this._socket)
    this._stompClient.connect(
      headers,
      () => {
        console.log('连接成功')
        if (send) {
          that._resend(resolve, reject)
        }
        this._stompClient.subscribe(receives, (response) => {
          // 接收到服务端信息的回调函数
          resolve({ data: response.body, code: '200' })
        })
      },
      (error) => {
        console.log(`断线了: ${error}`)
        that._reconnect(resolve, reject, error)
      }
    )
  }

  dispose() {
    if (this._stompClient) {
      this._stompClient.disconnect()
      this._clearTimeout()
      this._stompClient = null
      this._socket = null
    }
  }

  send = () => {
    const that = this
    that.resendNum = 0
    that.reConnectNum = 0
    return new Promise((resolve, reject) => {
      return that._connect(resolve, reject)
    }).catch((reject) => {
      return reject
    })
  }
}

export default StompWebSocket
