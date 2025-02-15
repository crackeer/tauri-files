import React, { useEffect, useState } from "react";
import "jsoneditor/dist/jsoneditor.css";
import "@arco-design/web-react/dist/css/arco.css";
import { Button, Input, Space, Message, Tabs, Table, Form, Modal } from "@arco-design/web-react";
import { writeTextFile, BaseDirectory, readTextFile, exists, create, mkdir } from '@tauri-apps/plugin-fs';
import { IconSave, IconImport, IconFire, IconAlignLeft, IconLaunch, IconStop, IconCopy } from "@arco-design/web-react/icon";
import dayjs from "dayjs";
import { save, open } from '@tauri-apps/plugin-dialog';
import { openPath } from '@tauri-apps/plugin-opener';
import {open as shellOpen} from '@tauri-apps/plugin-shell'
import invoke from "@/util/invoke";
import file from "@/util/file";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;



var editor = null;
const formItemLayout = {
    labelCol: {
        span: 5,
    },
    wrapperCol: {
        span: 18,
    },
};
function App1() {
    const [form] = Form.useForm();
    const [currentDir, setCurrentDir] = useState('')
    const [loading, setLoading] = useState(false)
    const [allDirs, setAllDirs] = useState([])
    const [files, setFiles] = useState([])
    const [visible, setVisible] = React.useState(false);
    const [selectDir, setSelectDir] = useState('')
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
                    <Button type='primary' status="info" size='mini' onClick={async () => {
                        console.log(record)
                        await openPath('C:/Users/liuhu/Downloads/AdvancedIPScanner2.5.4594.1.exe') 
                    }}>打开</Button>
                </Space>
            }
        }
    ];
    var initialize = async () => {
        let dirs = await file.getAllDirs()
        setAllDirs(dirs)

        let dir = await file.getCurrentDir()
        if (dir.length < 1 && dirs.length > 0) {
            dir = dirs[0].path
        }
        if (dir.length < 1) {
            return
        }
        setCurrentDir(dir)
    }

    var getFiles = async () => {
        setFiles([])
        setLoading(true)
        let data = await invoke.simpleReadDir(currentDir)
        setFiles(data)
        setLoading(false)
    }
    useEffect(() => {
        initialize()
    }, [])

    useEffect(() => {
        if (currentDir.length < 1) {
            return
        }
        getFiles()
    }, [currentDir])


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

    var handleAddTab = async () => {
        setVisible(true)
        form.setFieldsValue({
            name: '',
            path: '',
        })
        setSelectDir('')
    };

    var toAddPath = async () => {
        let value = form.getFieldsValue()
        console.log(value)
        if (!value.name || value.name.length < 1) {
            Message.error("请输入名字")
            return
        }
        console.log(selectDir)
        if (selectDir.length < 1) {
            Message.error("请选择文件夹")
            return
        }
        let dirs = [...allDirs, {
            name: value.name,
            path: selectDir,
        }]
        console.log(dirs)
        let result = await file.setAllDirs(dirs)
        Message.success("添加成功")
        setAllDirs(dirs)
    }

    var toSelectDir = async () => {
        let dir = await open({
            directory: true,
            multiple: false,
        });
        console.log(dir)
        if (dir.length > 0) {
            setSelectDir(dir)
        }
    }

  

    var onChangeTab = (key) => {
        Message.info("切换到" + key)
        setCurrentDir( key)
    }

    // 取消文件夹
    var cancelDir = (index, item) => {
        Modal.confirm({
            title: '提示',
            content: `确定取消该文件夹${item.name}(${item.path})?`,
            onOk: async () => {
                let tmpDirs = allDirs.filter((item, i) => {
                    return i != index
                })
                setAllDirs(tmpDirs)
                await file.setAllDirs(tmpDirs)
                Message.success("取消成功")
                if (tmpDirs.length < 1) {
                    setCurrentDir('')
                    setFiles([])
                    return
                }
                if (index > tmpDirs.length - 1) {
                    index = tmpDirs.length - 1
                }
                setCurrentDir(tmpDirs[index].path)
                getFiles()

            },
        });
    }
    var toDir = (index, item) => {
        console.log(index, item)
        shellOpen(item.path)
    }

    return <div style={{ padding: '10px' }}>
        <Modal>
            <Input style={{ width: '50%', marginBottom: '10px' }} allowClear placeholder='检索' />
        </Modal>

        <Tabs
            type='card-gutter'
            editable
            activeTab={currentDir}
            onAddTab={handleAddTab}
            onChange={onChangeTab}
            deleteButton={<></>}
            size="small"
        >
            {
                allDirs.map((item, index) => {
                    return <TabPane destroyOnHide title={item.name} key={item.path}>
                        <div style={{ paddingLeft: '10px', paddingBottom: '10px' }}>{item.path} <Space>

                            <Button type='outline' size="mini" icon={<IconLaunch />}  onClick={toDir.bind(this, index, item)}></Button>
                            <Button type='outline' size="mini" icon={<IconCopy />}></Button>
                            <Button type='outline' size="mini" status="danger" icon={<IconStop />} onClick={cancelDir.bind(this, index, item)}></Button>
                        </Space> </div>
                    </TabPane>
                })
            }
        </Tabs>

        <Table columns={columns} data={files} pagination={false} border={false} loading={loading} />

        <Modal
            title='添加文件夹'
            visible={visible}
            onOk={toAddPath}
            onCancel={() => setVisible(false)}
            autoFocus={false}
            focusLock={true}
        >
            <Form
                autoComplete='off'
                {...formItemLayout}
                form={form}
            >
                <FormItem label='名字' field='name' >
                    <Input placeholder='please enter your name' />
                </FormItem>
                <FormItem label='路径' rules={[{ required: true }]}>
                    {selectDir}
                    <Button type='text' onClick={toSelectDir} size="small">选择文件夹</Button>
                </FormItem>
            </Form>
        </Modal>
    </div>
}

export default App1
