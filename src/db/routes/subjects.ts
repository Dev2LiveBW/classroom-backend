import { departments } from './../schema/app';
import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { subjects } from "../schema";
import { db } from '..';

// Get all subjects with optional search, filtering, sorting, and pagination
const subjectsRouter = express.Router();
subjectsRouter.get("/", async (req: express.Request, res: express.Response) => {
    try {
        const { search, department, page = 1, limit = 10, sort = "desc" } = req.query;

        const currentPage = Math.max(parseInt(page as string) || 1);
        const limitPerPage = Math.max(parseInt(limit as string) || 10);
        
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        // If search query exists, filter by name or code
        if (search) {
            filterConditions.push(
                or(
                   ilike(subjects.name, `%${search}%`),
                   ilike(subjects.code, `%${search}%`)
                )
            );
        }
        // if department query exists, filter by department name
        if (department) {
            const deptPattern = `%${String(department).replace(/[%_]/g, "\\$&")}%`
            filterConditions.push(ilike(departments.name, deptPattern))
        }

        // combine all filters using AND if any filter exists
        const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

        const countResult = await db.select({  count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        const subjectsList = await db.select({
            ...getTableColumns(subjects),
            department: {
                ...getTableColumns(departments),
            }
        })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);
            
            res.status(200).json({
                data: subjectsList,
                pagination: {
                    page: currentPage,
                    limit: limitPerPage,
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / limitPerPage)
                }
            })

    } catch (e) {
        console.log(`GET /subjects error: ${e}`);
        res.status(500).json({ error: "Failed to GET subjects" });
    }
});


export default subjectsRouter;