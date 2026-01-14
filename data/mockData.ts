
import { Customer } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: '1',
        name: '联想集团 (Lenovo)',
        projectName: '全球采购系统 (SRM) 重构项目',
        updatedAt: '2024/01/15',
        status: '谈判',
        lastContact: '2023-11-02',
        assessmentScore: 60,
        assessmentResult: {
            score: 60,
            deal_health: 'At Risk',
            summary: "该单处于风险状态。主要问题在于决策链条中的EB（李淑芬）态度不明且尚未被触达，目前的Champion（刘经理）层级较低，难以对抗持负面态度的技术架构师。虽然预算和时间明确，但面对SAP Ariba的竞争，尚未建立绝对的技术或业务壁垒。痛点分析流于表面，急需通过量化ROI来打动高层决策者。",
            categories: [
                {
                    name: "需求与痛点 (Pain & Need)",
                    score: 60,
                    status: "Gap",
                    evidence: [
                        "识别了旧系统响应慢、数据孤岛和流程不透明三个核心痛点",
                        "痛点来源于初次会议和架构评审"
                    ],
                    missing: [
                        "缺乏痛点的财务量化（如：效率低下导致的每年直接损失金额）",
                        "未明确业务部门对‘透明’的具体衡量标准"
                    ],
                    coaching_tip: "刘经理，除了目前的系统响应问题，李淑芬总在年度集团会议上被问及供应链效率时，最让她头疼的具体KPI指标是什么？如果我们能帮她提升这些指标，她会如何评估我们的价值？"
                },
                {
                    name: "决策与权限 (Authority)",
                    score: 45,
                    status: "Gap",
                    evidence: [
                        "识别了EB（李淑芬）、Champion（刘经理）和Technical Buyer（王强/陈工）",
                        "Champion虽然支持但层级较低（经理级）"
                    ],
                    missing: [
                        "EB（李淑芬）态度中立且被标注为‘难搞’，目前未建立直接连接",
                        "IT架构师陈工持负面态度，可能在技术评审中设置障碍"
                    ],
                    coaching_tip: "刘经理，如果王总和李总在最终决策上出现分歧，谁拥有最终的一票否决权？我们如何才能安排一次与李总的非正式沟通，来了解她对ROI的具体期待？"
                },
                {
                    name: "方案与预算 (Solution & Budget)",
                    score: 75,
                    status: "Gap",
                    evidence: [
                        "预算350万明确",
                        "针对SAP ERP对接和高并发稳定性进行了深入讨论"
                    ],
                    missing: [
                        "尚未针对SAP Ariba的竞争威胁提出明确的差异化防御方案",
                        "350万预算是否已通过财务部正式审批（Approved Budget vs Budgetary Quote）"
                    ],
                    coaching_tip: "王总，考虑到联想目前深度依赖SAP，且SAP Ariba具备原生集成优势，您认为我们在高并发性能上的哪些表现是他们无法替代的关键差异点？"
                },
                {
                    name: "时机与竞争 (Timing & Competition)",
                    score: 60,
                    status: "Gap",
                    evidence: [
                        "有明确的上线时间要求：2024年Q1"
                    ],
                    missing: [
                        "缺乏倒推的关键决策日期（Decision Date）",
                        "未识别强迫性事件（Compelling Event），即为什么一定要在Q1上线"
                    ],
                    coaching_tip: "刘经理，为了确保Q1顺利上线，最晚必须在几号前完成合同签署？如果因为陈工的技术异议导致流程延至Q2，对您的部门目标会产生什么后果？"
                }
            ]
        },
        assessmentHistory: [
            { date: '2023-09-15', score: 45, deal_health: 'Critical', main_gap: '决策人未识别，预算不明确' },
            { date: '2023-10-05', score: 62, deal_health: 'At Risk', main_gap: '竞品 (SAP) 施压，技术架构存疑' },
            { date: '2023-11-02', score: 85, deal_health: 'Healthy', main_gap: '法务审核流程尚未启动' },
            { date: '2024-01-14', score: 60, deal_health: 'At Risk', main_gap: 'EB态度不明，竞品威胁未解除' }
        ],
        notes: "与全球采购 IT 负责人王总进行了第二轮深入沟通。重点讨论了新一代 SRM 系统与现有 SAP ERP 的数据对接问题。客户非常关注高并发下的稳定性。",
        persona: {
            industry: '消费电子 / 制造',
            companySize: '10000人以上',
            keyPainPoints: [
                { id: 'p1', description: '旧采购系统响应慢', createdAt: '2023-09-15', source: 'Manual' },
                { id: 'p2', description: '多系统数据孤岛', createdAt: '2023-10-01', source: 'Visit: Initial Meeting' },
                { id: 'p3', description: '供应商管理流程不透明', createdAt: '2023-11-02', source: 'Visit: Architecture Review' }
            ],
            currentSolution: '自研旧系统 + SAP ERP',
            decisionMakers: [
                { id: 'dm2', name: '李淑芬', title: '供应链 VP', role: 'Economic Buyer', stance: 'Neutral', notes: '关注ROI，比较难搞' },
                { id: 'dm1', name: '王强', title: 'IT Director', role: 'Technical Buyer', stance: 'Positive', contact: 'wangq@lenovo.example.com', reportsTo: 'dm2' },
                { id: 'dm4', name: '陈工', title: 'IT 架构师', role: 'Technical Buyer', stance: 'Negative', reportsTo: 'dm1' },
                { id: 'dm5', name: '刘经理', title: '采购经理', role: 'User Buyer', stance: 'Champion', reportsTo: 'dm2' }
            ],
            budget: '¥3,500,000',
            projectTimeline: '2024年 Q1 上线',
            competitors: ['SAP Ariba', 'Oracle']
        },
        visits: [
            { 
                id: '102',
                date: '2024-02-10',
                type: 'Meeting',
                status: 'Planned',
                title: '最终价格谈判与合同审核',
                visitGoal: '敲定最终折扣率，确保李淑芬(EB)对ROI满意',
                agendaItems: ['回顾 POC 测试结果', '展示 ROI 分析报告', '讨论阶梯报价方案', '确认法务审核流程'],
                targetQuestions: ['李总对于目前的总拥有成本(TCO)还有哪些具体顾虑？', '如果今天能达成一致，合同流转大概需要多久？'],
                content: '',
                stakeholderIds: ['dm1', 'dm2']
            },
            { 
                id: '101', 
                date: '2023-11-02', 
                type: 'Meeting', 
                status: 'Completed',
                title: 'SRM 系统集成与架构评审会议', 
                content: `【AI 智能总结】
1. 需求确认：王总确认了对高并发处理能力的硬性指标（TPS > 5000）。
2. 架构担忧：客户技术团队对微服务架构的数据一致性方案存疑。
3. 竞品动态：SAP Ariba 正在通过其全球生态优势施压，声称能更好地集成 ERP。`,
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                transcript: `王总: 我们现在最大的痛点就是双十一期间，旧系统经常卡顿，供应商那边抱怨很大。
我: 理解，我们的新架构是基于云原生的，弹性扩容能力很强，完全可以应对。
李淑芬: 技术是一方面，但我更关心成本和回报周期。SAP 虽然贵，但在这个领域很成熟。
我: 是的，但我们的定制化能力更强，而且后续的维护成本只有 SAP 的一半。`,
                images: [
                    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
                ],
                stakeholderIds: ['dm1', 'dm2']
            }
        ],
        researchNotes: [
            { id: '201', title: '联想供应链数字化转型战略', content: '联想集团宣布将在未来三年投入 10 亿用于供应链数字化，重点提升供应商协同效率与透明度。', timestamp: 1698115200000, url: 'https://example.com/news' }
        ]
    },
    {
        id: '2',
        name: 'TechFlow 科技',
        projectName: 'DevOps 自动化流水线升级',
        updatedAt: '2023/12/20',
        status: '合格',
        lastContact: '2023-10-24',
        assessmentScore: 65,
        notes: "与 Sarah (VP Engineering) 进行了沟通。他们正在快速扩张，需要更好的 CI/CD 工具。",
        persona: {
            industry: '软件/互联网',
            companySize: '200-500人',
            keyPainPoints: [
                { id: 'p1', description: '部署速度慢', createdAt: '2023-10-01', source: 'Manual' },
                { id: 'p2', description: '维护成本高', createdAt: '2023-10-24', source: 'Call' }
            ],
            currentSolution: 'Jenkins',
            decisionMakers: [
                { id: 'dm3', name: 'Sarah Wu', title: 'VP Engineering', role: 'Economic Buyer', stance: 'Champion', contact: 'sarah@techflow.io' }
            ],
            budget: '¥800,000',
            projectTimeline: '2023年 Q4',
            competitors: ['GitLab']
        },
        visits: [],
        researchNotes: []
    },
    {
        id: '3',
        name: '鲸鱼零售集团',
        projectName: '大型零售集团数字化门店项目',
        updatedAt: '2024/01/12',
        status: '线索',
        lastContact: '2024-01-10',
        notes: "",
        persona: {
            industry: '零售',
            companySize: '10000人+',
            keyPainPoints: [],
            currentSolution: '',
            decisionMakers: [],
            budget: '',
            projectTimeline: '',
            competitors: []
        },
        visits: [],
        researchNotes: []
    }
];
