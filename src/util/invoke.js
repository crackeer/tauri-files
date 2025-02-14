import { invoke } from '@tauri-apps/api/core';

var simpleReadDir = async (dir) => {
    try {
        let Result = await invoke('simple_read_dir', {
            dir: dir
        }) 
        return Result
    } catch (e) {
        console.log(e)
        return [] 
    }
}

var deleteFile = async (path) => {
    let Result = await invoke('delete_file_or_dir', {
        path: path
    })
    return Result
}

export {
    simpleReadDir, deleteFile
}

export default {
    simpleReadDir, deleteFile
}
