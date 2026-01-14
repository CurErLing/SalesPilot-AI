
import { Customer } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
    {
        id: '1',
        name: '联想集团 (Lenovo)',
        projectName: '全球采购系统 (SRM) 重构项目',
        updatedAt: '2024/01/15',
        status: '谈判',
        lastContact: '2023-11-02',
        assessmentScore: 85,
        notes: "与全球采购 IT 负责人王总进行了第二轮深入沟通。重点讨论了新一代 SRM 系统与现有 SAP ERP 的数据对接问题。客户非常关注高并发下的稳定性。",
        persona: {
            industry: '消费电子 / 制造',
            companySize: '10000人以上',
            keyPainPoints: ['旧采购系统响应慢', '多系统数据孤岛', '供应商管理流程不透明'],
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
            keyPainPoints: ['部署速度慢', '维护成本高'],
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
