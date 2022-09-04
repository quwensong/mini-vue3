import { NodeTypes } from './ast'

function createParseContext(template:string){
    return {
        line:1,
        column:1,
        offset:0,
        source:template,// 此字段会被不停的解析
        originalSource:template
    }

}

function advancePositionWithMutation(
    pos: any,
    source: string,
    numberOfCharacters: number = source.length
  ):any {
    let linesCount = 0
    let lastNewLinePos = -1
    for (let i = 0; i < numberOfCharacters; i++) {
      if (source.charCodeAt(i) === 10 /* newline char code */) {
        linesCount++
        lastNewLinePos = i
      }
    }
    pos.offset += numberOfCharacters
    pos.line += linesCount
    pos.column =
      lastNewLinePos === -1          
        ? pos.column + numberOfCharacters
        : numberOfCharacters - lastNewLinePos


    // debugger
    return pos
  }



function getCursor(context:any){
    let { line,column,offset } = context 

    return { line, column, offset}

}

function advanceBy(context:any,endIndex:number){
    let source = context.source
    // 每次删掉内容的时候都要删掉，更新最新的行列信息，偏移量信息
    advancePositionWithMutation(context,source,endIndex)

    context.source = source.slice(endIndex)
}

function parseTextData(context:any,endIndex:number){
    // debugger
    const rawText = context.source.slice(0,endIndex)
    advanceBy(context,endIndex)

    return rawText
}

function getSelection(context:any,start:any, end?:any){
    end = end || getCursor(context)
// debugger
    return {
        start,
        end,
        source:context.originalSource.slice(start.offset, end.offset)
    }

}

function parseInterpolation(context:any){ // 处理表达式的信息
    const start  =  getCursor(context)
    const closeIndex = context.source.indexOf('}}','{{')//查找结束的大括号

    advanceBy(context,2)

    const innerStart = getCursor(context)
    const innerEnd = getCursor(context)

    const rawContentLength = closeIndex - 2
    let preContent = parseTextData(context,rawContentLength)
    let content = preContent.trim()
    let startOffset =  preContent.indexOf(content)

    if(startOffset > 0){
        advancePositionWithMutation(innerStart,preContent,startOffset)
    }

    let endOffset = startOffset + content.length
    advancePositionWithMutation(innerEnd,preContent,endOffset)

    advanceBy(context,2)

    return {
        type:NodeTypes.INTERPOLATION,
        content:{
            type: NodeTypes.SIMPLE_EXPRESSION,
            content,
            loc:getSelection(context,innerStart,innerEnd)
        },
        lpc:getSelection(context,start)
    }

}
function advanceBySpaces(context:any){
    let match =  /^[ \t\r\n]+/.exec(context.source)
    if(match){
        advanceBy(context,match[0].length)
    }
}
function parseAttributeValue(context:any){
    const start = getCursor(context)
    let quote =  context.source[0]
    let content:any;
    if(quote == '"' || quote == "'"){
        advanceBy(context,1)
        const endIndex = context.source.indexOf(quote)
        content = parseTextData(context,endIndex)
        advanceBy(context,1)
    }
    return {
        content,
        loc:getSelection(context,start)
    }
}

function parseAttribute(context:any){
    const start = getCursor(context)

    const match:any = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
    let name = match[0]
    advanceBy(context,name.length)

    advanceBySpaces(context)
    advanceBy(context,1)
    let value = parseAttributeValue(context)

    const loc = getSelection(context,start)
    return {
        type:NodeTypes.ATTRIBUTE,
        name,
        value:{
            type:NodeTypes.TEXT,
            ...value
        },
        loc:getSelection(context,start)
    }
}
function parseAttributes(context:any){
    const props:Array<any> = []
    while(context.source.length > 0 && !context.source.startsWith('>')){
        const prop = parseAttribute(context)
        props.push(prop)
        advanceBySpaces(context)
    }
    return props
}

function parseTag(context:any){
    const start = getCursor(context)
    const match:any = /^<\/?([a-z][^ \t\r\n/>]*)/.exec(context.source)
    const tag = match[1]
    // debugger
    advanceBy(context,match[0].length)
    advanceBySpaces(context)

    let props = parseAttributes(context)

    let isSelfClosing = context.source.startsWith('/>')

    advanceBy(context,isSelfClosing?2:1)
    return {
        type: NodeTypes.ELEMENT,
        tag:tag,
        isSelfClosing,
        children:[],
        props,
        loc:getSelection(context,start)
    }

}

function parseChildren(context:any){
    const nodes:Array<any> = []
    // debugger 
    while(isEndParse(context)){
        const source = context.source
        let node:any
        
        if(source.startsWith('{{')){
            node = parseInterpolation(context)

        }else if(source[0] === '<'){
            node = parseElement(context)

        }
        if(!node){
            node = parseText(context)
            
        }
        nodes.push(node)
    }
    nodes.forEach((node,i)=>{
        if(node.type === NodeTypes.TEXT){
            if(!/[^\t\r\n\f ] /.test(node.content)){
                nodes[i] = null
            }
        }
    })

    return nodes.filter(Boolean)
}

function parseElement(context:any){
    let ele:any = parseTag(context)

    // 儿子

    let children =  parseChildren(context)


    if(context.source.startsWith('</')){
        parseTag(context)
    }
    ele.loc = getSelection(context,ele.loc.start)
    ele.children = children
    return ele
}

function parseText(context:any){
    // 在解析文本的时候要判断到哪里结束
    let endTokens = ['<','{{']

    let endIndex = context.source.length // 默认到最后结束
    // indexOf // 第二个参数规定在字符串中开始检索的位置。它的合法取值是 0 到 stringObject.length - 1。如省略该参数，则将从字符串的首字符开始检索。
    for (let i = 0; i < endTokens.length; i++){
        let index = context.source.indexOf(endTokens[i],1)
        // 找到了并且第一次比整个字符串小
        if(index !== -1 && endIndex > index){
            endIndex = index
        }
    }
    // 创建 行列信息
    const start = getCursor(context)

    const content = parseTextData(context,endIndex)

    return {
        type: NodeTypes.TEXT,
        content:content,
        loc:getSelection(context,start)
    }
}

function isEndParse(context:any){
    // debugger
    // 如果解析完毕后为空字符串说明解析完毕，结束递归
    const source = context.source
    if(context.source.startsWith('</')){
        return false;
    }
    return !!source
}
function parse(template:string){
    const context = createParseContext(template)
    // < 元素
    // {{表达式}}
    // 其他就是文本
    const start = getCursor(context)

    return createRoot(parseChildren(context),getSelection(context,start))
}

function createRoot(children:any,loc:any){
    return {
        type:NodeTypes.ROOT,
        children,
        loc
    }
}

export function compile(template:string){
    const ast = parse(template);

    return ast;
}