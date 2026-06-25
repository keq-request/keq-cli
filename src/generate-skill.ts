import * as fs from 'fs-extra'
import * as path from 'path'


export async function generateSkill(): Promise<void> {
  const skillSource = path.join(__dirname, 'skill/SKILL.md')
  const skillContent = await fs.readFile(skillSource, 'utf-8')

  const targetDir = path.join(process.cwd(), '.claude/skills/keq-cli')
  await fs.ensureDir(targetDir)

  const targetPath = path.join(targetDir, 'SKILL.md')
  await fs.writeFile(targetPath, skillContent, 'utf-8')
}
