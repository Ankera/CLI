import Command from '@zm-template/ac-command'
import { log, printErrorLog, makeList } from '@zm-template/ac-utils'
import { ESLint } from 'eslint'
import path from 'node:path'
import { execa } from 'execa'

class YwCommand extends Command {
  constructor(program) {
    super(program)
  }

  get command() {
    return 'yw <id>'
  }

  get description() {
    return 'yw生成 - API 工具'
  }

  get options() {
    return [['-id --identity  <type>', 'ya api 唯一身份ID']]
    // ['-p --publish', '发布', false],
  }

  async action(identity) {
    const projectId = await makeList({
      message: '请选择项目类型',
      defaultValue: 'PRO_XY_LIVE',
      choices: [
        {
          name: '直播<yw-broadcast>',
          value: 'PRO_XY_LIVE',
        },
        {
          name: '电狼<yw-dianlang>',
          value: 'PRO_DIANLANG',
        },
        {
          name: '商品中心<yw-goods>',
          value: 'PROGOODS',
        },
        {
          name: '商家<yw-supply>',
          value: 'PROSUPPLIER',
        },
        {
          name: '电虎<yw-supply>',
          value: 'PRO_DIANHU',
        },
      ],
    })

    log.verbose('commit参数', identity, projectId)

    await execa('yw', ['api', identity, `--projectId=${projectId}`], {
      stdout: 'inherit',
    })
  }
}

function Yw(program) {
  return new YwCommand(program)
}

export default Yw
