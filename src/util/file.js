import { writeTextFile, BaseDirectory, readTextFile, exists, create, mkdir } from '@tauri-apps/plugin-fs';


var readFile = async (name) => {
    try {
        let value = await readTextFile(name, { baseDir: BaseDirectory.AppData });
        return value
    } catch (e) {
        return ''
    }
}

var writeFile = async (name, value) => {
    try {
        let dirExists = await exists('', {
            baseDir: BaseDirectory.AppData,
        });
        if (!dirExists) {
            await mkdir('', { baseDir: BaseDirectory.AppData });
        }
        let fileExists = await exists(name, {
            baseDir: BaseDirectory.AppData,
        });
        if (!fileExists) {
            let result = await create(name, { baseDir: BaseDirectory.AppData });
        }
        return await writeTextFile(name, value, { baseDir: BaseDirectory.AppData });
    } catch (e) {
        return false;
    }
}
var getCurrentDir = async () => {
    try {
        let value = await readFile('current_dir')
        return value
    } catch (e) {
        return '';
    }
}
var setCurrentDir = async (value) => {
    return await writeFile('current_dir', value)
}

var getAllDirs = async () => {
    let dirs = []
    try {
        let dirsStr = await readFile('all_dirs')
        return JSON.parse(dirsStr)
    } catch (e) {
        return dirs; 
    }
}

var setAllDirs = async (value) => {
    return await writeFile('all_dirs', JSON.stringify(value))  
}

export default {
    getCurrentDir, setCurrentDir, getAllDirs, setAllDirs
}