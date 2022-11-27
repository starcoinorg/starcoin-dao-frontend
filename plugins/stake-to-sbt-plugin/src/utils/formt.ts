export function formatLockTime(time: number) {
    let remain = time
    let c = ""

    const hour = 60 * 60
    if (remain > hour) {
        const s = Math.floor((remain / hour))
        c += `${s} hours `
        remain = remain - s * hour
    }

    const minute = 60
    if (remain > minute) {
        const s = Math.floor((remain / minute))
        c += `${s} minutes `
        remain = remain - s * minute
    }

    if (remain > 0) {
        c += `${remain} seconds`
    }

    return c
}