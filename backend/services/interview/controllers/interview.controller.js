import graph from "../graph/graph.js";
import Interview from "../models/interview.model.js";
import redis from "../../../shared/redis/redis.js";


export const startInterview = async (req,res) =>{
    try {
        const userId = req.headers["x-user-id"]
        const {
            type,
            role,
            useResume= false,
            resume ={}} = req.body;
        
            if(!type && !role){
                return res.status(400).json({
                    success:false,
                    message:"Interview type and role are required",
                });
            }
            const result = graph.invoke({
                action:"start",
                role,
                type,
                useResume,
                resume
            })

            const questions = (await result).questions;

            if(!questions || questions.length ===0){
                return res.status(500).json({
                    success:false,
                    message:"Failed to generate interview questions",
                });
            }

            const interview = await Interview.create({
                userId,
                type,
                role,
                useResume,
                questions,
                currentQuestion:0,
                status: "in-progress",
            })
            await redis.del(`interviews:${userId}`);

            return res.status(200).json({
                success:true,
                interviewId: interview._id,
                currentQuestion:0,
                totalQuestions:interview.questions.length,
                question: interview.questions[0],
            })


    } catch (error) {
        console.log(error)

        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


export const submitAnswer = async (req,res) =>{
    try{
        const userId = req.headers["x-user-id"]
        const {interviewId, answer} = req.body

        if(!interviewId && !answer){
            return res.status(400).json({
                success:false,
                message:"Interview Id and Answer are required",

            })
        }

        const interview = await Interview.findOne({
            _id: interviewId,
            userId
        })

        if(!interview){
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            })
        }

        if(interview.status === "completed"){
            return res.status(400).json({
                success:false,
                message: "Interview already completed",
            });

        }

        const index = interview.currentQuestion
        const currentQuestion= interview.questions[index]

        if(!currentQuestion){
            return res.status(400).json({
                success:false,
                message:"Invalid question index",
            })
        }

        currentQuestion.userAnswer= answer;

        const completed = interview.currentQuestion +1 >= interview.questions.length;
        
        const result = await graph.invoke({
            action:"feedback",
            question: currentQuestion.question,

            answer,
            difficulty: currentQuestion.difficulty,

            completed,
            role:interview.role,
            type:interview.type,

            questions:interview.questions,

        })

        currentQuestion.feedback = result.feedback;

        interview.currentQuestion++;

        if(completed){
            interview.status= "completed";

            interview.overallScore= result.report.overallScore;

            interview.summary= result.report.summary;

            interview.strengths = result.report.strengths;

            interview.weaknesses = result.report.weaknesses;

            interview.recommendations = result.report.recommendations;


        await interview.save()
        await redis.del(`interviews:${userId}`);

        return res.status(200).json({
            success: true,
            completed: true,
            interview,
        })

        }

        
        await interview.save()

        return res.status(200).json({
            success:true,
            completed:false,
            currentQuestion: interview.currentQuestion,
            question:interview.questions[interview.currentQuestion],
            feedback: result.feedback,
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })


    }
}


export const getInterview = async (req,res) =>{
    try {
        const userId = req.headers["x-user-id"]
        const {id} = req.params

        const interview = await Interview.findOne({
            _id:id,
            userId
        })

         if(!interview){
            return res.status(400).json({
                success:false,
                message: "Interview not found"
            })
        }

        return res.status(200).json({
            success:true,
            interview,
        })

    } catch (error) {
         console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}



const getAverageData = (list = []) => {
    const metrics = [
        "correctness",
        "clarity",
        "relevance",
        "detail",
        "efficiency",
        "communication",
        "problemSolving",
        "creativity",
    ];

    const totals = Object.fromEntries(
        metrics.map((metric) => [metric, 0])
    );

    let count = 0;

    list.forEach((interview) => {
        (interview.questions || []).forEach((question) => {
            metrics.forEach((metric) => {
                totals[metric] += Number(
                    question.feedback?.[metric] || 0
                );
            });

            count++;
        });
    });

    return metrics.map((metric) => ({
        skill: metric,
        score: count
            ? Math.round(totals[metric] / count)
            : 0,
    }));
};



export const getAllInterviews = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID is required",
      });
    }

    const cacheKey = `interviews:${userId}`;

    // Check Redis cache
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log("Dashboard data served from Redis");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Fetch interviews from MongoDB
    const interviews = await Interview.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Completed interviews
    const completed = interviews.filter(
      (item) => item.status === "completed"
    );

    // Total questions
    const totalQuestions = interviews.reduce(
      (sum, item) => sum + (item.questions?.length || 0),
      0
    );

    // Average score
    const averageScore = completed.length
      ? Number(
          (
            completed.reduce(
              (sum, item) => sum + (Number(item.overallScore) || 0),
              0
            ) / completed.length
          ).toFixed(1)
        )
      : 0;

    // Separate Technical and HR interviews
    const technicalInterviews = completed.filter(
      (item) => item.type?.toLowerCase() === "technical"
    );

    const hrInterviews = completed.filter(
      (item) => item.type?.toLowerCase() === "hr"
    );

    // Skill-wise average
    const technicalData = getAverageData(technicalInterviews);
    const hrData = getAverageData(hrInterviews);

    // Dashboard response
    const payload = {
      success: true,

      stats: {
        totalInterviews: interviews.length,
        totalQuestions,
        completedInterviews: completed.length,
        averageScore,
      },

      technicalData,
      hrData,

      technicalCount: technicalInterviews.length,
      hrCount: hrInterviews.length,

      interviews,
    };

    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(payload), "EX", 600);

    return res.status(200).json(payload);

  } catch (error) {
    console.error("Get all interviews error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




