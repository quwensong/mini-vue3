let queue: Array<any>= []
let isFlushing = false
const resolvePromise = Promise.resolve()

export function queueJob(job: any){
   
    if(!queue.includes(job)){
        queue.push(job)
    } 
    if(!isFlushing){
        isFlushing = true
        resolvePromise.then(()=>{
            isFlushing = false
            let copyqueue = queue.slice(0)
            queue.length = 0
            for(let i=0; i< copyqueue.length; i++){
                let job = copyqueue[i]
                job()
            }
            copyqueue.length = 0
        })
    }

}
