
import { Customer, Stakeholder } from '../types';

/**
 * 1. 画像提取提示词 (Updated for Context Awareness)
 */
export const getExtractPersonaPrompt = (rawText: string, currentPersona?: any) => `
你是一个智能 CRM 数据助手。你的目标是根据新的输入笔记**更新**客户画像。

当前已有的画像数据 (JSON):
${JSON.stringify(currentPersona || {})}

新的输入笔记:
"${rawText}"

指令:
1. **增量更新**: 仅提取新输入中包含的信息。
2. **保留规则 (关键)**: 如果新输入中未提及某个字段，请不要在输出 JSON 中包含该字段。不要返回 null、空字符串或 "Unknown"，让它们保持未定义，以便系统保留现有数据。
3. **智能计算**: 如果新输入暗示了相对于现有数据的变化（例如“预算增加了 3000 万”，“时间表推迟了 1 个月”），请基于当前画像值进行计算。
   - 示例: 如果当前预算是 "500万"，输入是 "追加3000万"，新预算应为 "3500万"。
4. **项目背景**: 将任何高层项目背景、业务驱动因素或总体目标提取到 'projectBackground' 字段中。
5. **数组**: 对于 'keyPainPoints' 或 'competitors' 等列表，返回发现的**新**条目。系统会将它们合并。
6. **语言**: 将提取的值翻译成**中文**。

仅以 JSON 格式输出需要更新的字段。
`;

/**
 * 2. 客户价值评估 (MEDDIC/BANT) 提示词
 */
export const getAssessmentPrompt = (customer: Customer) => `
作为一名严苛的销售总监，请对客户 "${customer.name}" 进行基于 MEDDIC/BANT 模型的赢单资格审查。

客户数据: ${JSON.stringify(customer.persona)}
最近笔记: ${customer.notes}

请评估以下4个维度:
1. 需求与痛点 (Pain & Need): 痛点是否清晰且量化？业务场景与客户预期是否明确？
2. 决策与权限 (Authority): 是否找到了决策人(EB/Champion)？
3. 方案与预算 (Solution & Budget): 我们的方案是否匹配？预算是否充足？
4. 时机与竞争 (Timing & Competition): 竞争态势如何？上线时间是否明确？

请以 JSON 格式返回，包含总分(0-100)，健康状态，以及每个维度的详细差距分析(Gap Analysis)。
"coaching_tip" 必须是一个具体的、可以直接问客户的问题，用于补齐缺失信息。
`;

/**
 * 3. 销售策略生成提示词 (Enhanced for Solution Output)
 */
export const getStrategyPrompt = (customer: Customer) => `
你是一位资深销售总监。请为客户 ${customer.name} 制定详细的跟进策略。

背景信息:
- 当前状态: ${customer.status}
- 画像数据: ${JSON.stringify(customer.persona)}
- 笔记: ${customer.notes}

请以 JSON 格式输出以下具体内容：
1. immediate_action: 基于现状，必须要做的下一步（50字以内）。
2. email_draft: 针对下一步的一封跟进邮件（subject 和 body）。
3. call_script: 如果打电话，应该怎么说的脚本（口语化）。
4. objections: 预测 2-3 个客户可能提出的异议（objection），并提供回应话术（response）。
5. proposal_focus: 针对该客户的方案编写建议。请包含：
   - "value_prop": 核心价值主张 (一句话直击痛点)。
   - "case_study": 建议引用的成功案例类型 (如：同行业/同规模)。
   - "pricing_strategy": 针对其预算的报价策略建议。

所有内容用中文回答。
`;

/**
 * 4. 网络调研提示词
 */
export const getWebResearchPrompt = (query: string) => `
请调研以下关于客户或行业的信息：${query}。
请提供一个简洁的中文摘要，突出关键业务信息（如新闻、财报、高管变动、市场动态）。
`;

/**
 * 5. 聊天助手系统指令
 */
export const getChatSystemInstruction = (customerContext: Customer) => `
你是一个乐于助人的中文销售助手 AI。
你正在协助销售代表处理特定客户：${customerContext.name}。

这是客户的已知数据：
${JSON.stringify(customerContext.persona)}

最近的笔记：
${customerContext.notes}

最近的拜访记录：
${JSON.stringify(customerContext.visits)}

请用中文回答关于该客户的问题，建议销售策略，或协助起草文档。
保持回答简洁且具有可操作性。
`;

/**
 * 6. 会议录音分析提示词 (LEGACY - for direct audio processing if needed)
 */
export const getAudioAnalysisPrompt = () => `
作为一名专业的销售助理，请分析这段销售会议/通话录音。
请执行以下操作：
1. 识别这主要是一次会议 (Meeting) 还是电话 (Call)。
2. 总结简短的标题 (如：初次需求沟通, 价格谈判)。
3. 提供一段结构化的中文总结 (summary)，包含关键发现、客户反馈。
4. 提取明确的下一步行动计划 (nextSteps)，包括负责人和时间节点（如果有）。
5. 分析会议的情感/成效 (sentiment)：Positive(顺利/积极), Neutral(一般), Negative(消极/拒绝), Risk(有明显风险)。
6. 提供完整的逐字稿 (transcript)。

请以 JSON 格式返回。
`;

/**
 * 6b. 仅生成逐字稿 (Transcription Only) - Updated for Timeline Format
 */
export const getTranscriptionPrompt = () => `
请将这段音频转录为带有时间戳的逐字稿。

格式要求：
[MM:SS] 发言人: 内容

示例：
[00:00] 销售: 王总您好，感谢您拨冗参加今天的会议。
[00:05] 王总: 没关系，我们直接开始吧。

要求：
1. 严格按照上述 "[MM:SS] Speaker: Content" 的格式换行输出。
2. 尽可能区分不同的发言人（如发言人1, 发言人2，或者根据上下文推断的角色）。
3. 忽略语气词，保持专业。
4. 直接输出纯文本。
`;

/**
 * 6c. 基于逐字稿生成洞察 (Insights from Text)
 */
export const getInsightsFromTranscriptPrompt = (transcript: string) => `
作为一名专业的销售助理，请分析以下销售会议逐字稿。

逐字稿内容:
"${transcript}"

请执行以下操作并以 JSON 格式返回：
1. type: 识别是会议 (Meeting) 还是电话 (Call)。
2. title: 总结一个简短的标题。
3. summary: 提供一段结构化的中文总结，包含关键发现。
4. nextSteps: 提取明确的下一步行动计划 (Action Items)。
5. sentiment: 分析情感 (Positive/Neutral/Negative/Risk)。
`;

/**
 * 7. 销售话术生成提示词
 */
export const getSalesPitchPrompt = (painPoint: string, customer: Customer) => `
你是一名顶尖销售。
客户: ${customer.name}
痛点: "${painPoint}"
画像数据: ${JSON.stringify(customer.persona)}

请针对这个痛点，写一段简短、有针对性的销售话术（Talking Point），用于向客户展示我们解决方案的价值，直击痛点。
请保持专业、自信、富有同理心。限制在 50 字以内。中文回答。
`;

/**
 * 8. 破冰话术生成提示词
 */
export const getIceBreakerPrompt = (noteContent: string, customer: Customer) => `
你是一名销售顾问。
客户: ${customer.name}
最新调研情报: "${noteContent}"

请基于这条情报，为销售代表写一段**破冰话术**（微信或邮件开场白）。
目的：利用这条新闻/信息作为切入点，联系客户，并巧妙地关联到我们的业务（数字化/软件服务）。
风格：专业、不生硬、简短（80字以内）。中文回答。
`;

/**
 * 9. 工商信息填充提示词
 */
export const getFirmographicsPrompt = (companyName: string) => `
请搜索 "${companyName}" 的工商信息。
只返回该公司的：
1. 所属行业 (Industry) - 例如：软件开发，制造业，金融。
2. 公司规模 (Company Size) - 例如：100-500人，1000人以上，上市公司。

如果找不到确切信息，请根据已知信息进行合理估算。
`;

/**
 * 10. 角色扮演系统指令
 */
export const getRolePlaySystemInstruction = (customer: Customer, targetStakeholder: Stakeholder) => `
Roleplay Simulation:
你现在不是 AI 助手，你需要扮演客户 "${customer.name}" 的决策人：

姓名: ${targetStakeholder.name}
职位: ${targetStakeholder.title}
角色: ${targetStakeholder.role}
性格/立场: ${targetStakeholder.stance} (如果是 Champion，你会比较友好但关注落地；如果是 Blocker，你会非常刁钻、质疑价值)。

客户背景:
行业: ${customer.persona.industry}
痛点: ${customer.persona.keyPainPoints?.join(', ')}

任务：
1. 请完全沉浸在角色中，用第一人称对话。
2. 不要说自己是 AI。
3. 根据用户的销售话术做出真实的反应（感兴趣、质疑、拒绝、询问细节）。
4. 每次回复保持简短（50字以内），像真实的微信或面对面沟通。

语言：中文。
`;

/**
 * 11. 拜访计划生成提示词
 */
export const getVisitPlanPrompt = (customer: Customer, goal: string, stakeholders: any[]) => `
你是一名销售策略专家。请为客户 "${customer.name}" 的下一次拜访制定计划。

设定目标: ${goal}
参会决策人: ${stakeholders.map(s => `${s.name}(${s.role})`).join(', ')}
客户画像: ${JSON.stringify(customer.persona)}

请生成以下内容（JSON格式）：
1. agendaItems: 建议的会议议程 (3-5项)。
2. targetQuestions: 3个必问的"黄金问题" (Golden Questions)，用于挖掘潜在需求或确认预算/权限/时机 (BANT/MEDDIC)。
3. requiredMaterials: 建议携带的物料或展示内容。

请确保问题具有攻击性但礼貌，能够填补画像中的未知信息。
`;

/**
 * 12. 竞品狙击卡生成提示词 (NEW)
 */
export const getCompetitorBattleCardPrompt = (competitorName: string, customer: Customer) => `
你是一名擅长竞争性销售(Competitive Selling)的专家。请为销售代表生成一份针对竞品 "${competitorName}" 的狙击卡 (Battle Card)。

客户背景:
- 名称: ${customer.name}
- 行业: ${customer.persona.industry}
- 痛点: ${customer.persona.keyPainPoints?.map(p => p.description).join(', ')}

请以 JSON 格式返回以下内容 (BattleCardData)：
1. competitor_strength: 竞品最大的优势或客户通常喜欢的点 (客观承认)。
2. competitor_weakness: 竞品在当前行业或场景下的主要弱点/劣势。
3. our_kill_points: 一个字符串数组，包含 3 个针对性的反击话术/优势卖点 (Kill Points)。这些话术应该直接针对竞品的弱点。
4. trap_question: 一个“挖坑问题” (Trap Question)。销售可以问客户这个问题，从而引导客户自己意识到竞品的问题。

回答要求：
- 语言：中文。
- 风格：犀利、直接、专业。
- 必须基于 "${customer.persona.industry}" 行业的通识进行分析。
`;
