import React, { useEffect, useState } from "react";
import "jsoneditor/dist/jsoneditor.css";
import "@arco-design/web-react/dist/css/arco.css";
import { Button, Input, Space, Message, Tabs, Table, Radio, Modal } from "@arco-design/web-react";
import { writeTextFile, BaseDirectory, readTextFile, exists, create, mkdir } from '@tauri-apps/plugin-fs';
import { IconSave, IconImport, IconFire, IconAlignLeft, IconRefresh, IconAlignRight, IconCopy } from "@arco-design/web-react/icon";
import JSONEditor from 'jsoneditor';
import dayjs from "dayjs";
import { save, open } from '@tauri-apps/plugin-dialog';
import invoke from "@/util/invoke";
import jsonToGo from "@/util/json-to-go";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
const TabPane = Tabs.TabPane;
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
var getDir = async () => {
    try {
        let value = await readFile('current_dir')
        return value
    } catch (e) {
        return '';
    }
}
var setDir = async (value) => {
    return await writeFile('current_dir', value)
}

var readDir = async (dir) => {
    try {
        console.log(dir)
        let value = await invoke.simpleReadDir(dir)
        console.log(value)
        return value
    } catch (e) {
        console.log(e)
        return [];
    }
}





const testDirs = [
    {
        "name": "下载",
        "path": "C:\\Users\\liuhu\\Downloads"
    }
]

var editor = null;
function App1() {
    const [currentDir, setCurrentDir] = useState('')
    const [keyDirs, setKeyDirs] = useState(testDirs)
    const [files, setFiles] = useState([])
    const columns = [
        {
            title: '名字',
            dataIndex: 'name',
        },
        {
            title: '大小',
            dataIndex: 'human_size',
        },
        {
            title: '创建时间',
            dataIndex: 'create_at',
        },
        {
            title: '修改时间',
            dataIndex: 'modify_at',
        },
        {
            title: '操作',
            dataIndex: 'action',
            render: (text, record) => {
                return <Space size="mini">
                    <Button type='primary' status="danger" size='mini' onClick={toDelete.bind(this, record)}>
                        删除
                    </Button>
                </Space>
            }
        }
    ];
    var initialize = async () => {
        let dir = await getDir()
        console.log("dir", dir)
        if (dir.length < 1 && testDirs.length > 0) {
            dir = testDirs[0].path
        }
        setCurrentDir(dir)
        let data = await readDir(dir)
        setFiles(data)
    }
    var getFiles = async () => {
        let data = await readDir(currentDir)
        setFiles(data)
    }
    useEffect(() => {
        initialize()
    }, [])


    var copy = () => {
        let text = editor.getText()
        writeText(text).then(() => {
            Message.success("复制成功")
        })
    }

    var toDelete = async (record) => {
        try {
            let result = await invoke.deleteFile(record.path)
            Message.success("删除成功")
            getFiles()
        } catch (e) {
            console.log(e)
            Message.error("删除失败")
        }
    }
    return <div style={{ padding: '10px' }}>

        <Modal>
            <Input style={{ width: '50%', marginBottom: '10px' }} allowClear placeholder='检索' />
        </Modal>
        <Radio.Group defaultValue={'Beijing'} name='button-radio-group' style={{ margin: '10px auto', textAlign: 'center', display: 'block' }}>
            {testDirs.map((item) => {
                return <Radio key={item.path} value={item.path}>
                    {({ checked }) => {
                        return (
                            <Button tabIndex={-1} key={item.path} type={checked ? 'primary' : 'default'}>
                                {item.name}
                            </Button>
                        );
                    }}
                </Radio>

            })}
        </Radio.Group>
        <Table columns={columns} data={files} pagination={false} />
    </div>
}

export default App1
