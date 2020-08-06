export function mapStateToProps(state: any, ownProps: any) {
  const { type, modelKey, model } = ownProps
  let ns = ''
  if (type) {
    let offsetIndex = type.lastIndexOf('/')
    ns = type.substr(0, offsetIndex)
  } else {
    ns = model
  }
  if (ns) {
    return {
      data: modelKey ? state[ns][modelKey] : [],
      loading: state['loading'] ? state['loading']['effects'][type] : false,
    }
  } else {
    return {}
  }
}
export function mapStateToPropsByKey(params: {
  key: string
  value: any
  callBack: any
}) {
  const { callBack } = params
  return function(state: any, ownProps: any) {
    let { type, modelKey, model } = ownProps
    let ns = ''
    if (type) {
      let offsetIndex = type.lastIndexOf('/')
      ns = type.substr(0, offsetIndex)
    } else {
      ns = model
    }
    if (!modelKey && params.key) {
      modelKey = params.key
    }
    let retData: any = {}
    if (ns) {
      retData = {
        data: modelKey
          ? state[ns][modelKey]
          : params.value
          ? params.value
          : null,
        loading: state['loading'] ? state['loading']['effects'][type] : false,
      }
      if (callBack) {
        retData = callBack(retData, state[ns], ownProps)
      }
    }
    return retData
  }
}
export function mapDispatchToProps(dispatch: any) {
  return {
    dispatch,
  }
}
