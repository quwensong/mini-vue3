export function getSequence(arr: Array<any>){
        const len = arr.length
        const result = [0]
        const p = new Array(len).fill(0)
        let start;
        let end;
        let middle;
        let resultLastIndex;
        for (let i = 0; i < len; i++) {
            let arrI = arr[i]
            if(arrI !== 0){
                resultLastIndex = result[result.length - 1]
                if(arr[resultLastIndex] < arrI){
                    result.push(i)
                    p[i] = resultLastIndex;
                    continue
                }
                start = 0
                end = result.length - 1
                while (start < end){
                    middle = ((start + end) / 2) | 0
                    if(arr[result[middle]] < arrI){
                        start = middle + 1
                    }else{
                        end = middle
                    }
                }
                if(arr[result[end]] > arrI){
                    result[end] = i

                    p[i] = result[end - 1]
                }
            } 
        }
        let i = result.length

        let last = result[i - 1]
        while (i-- > 0){ 
            result[i] = last
            last = p[last]

        }
        return result;
    }
    