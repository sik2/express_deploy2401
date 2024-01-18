import express from "express";
import pkg from 'pg';
import cors from "cors";

const { Pool } = pkg;

// Username:    postgres
// Password:    8ydKA0QRwZyc77t
// Hostname:    todo2401-db.internal
// Flycast:     fdaa:5:325b:0:1::9
// Proxy port:  5432
// Postgres port:  5433
const pool = new Pool({
    user: 'postgres',
    password: '8ydKA0QRwZyc77t',
    host: 'todo2401-db.internal',
    database: 'postgres',
    port: 5432,
  });


const app = express();

const corsOptions = {
    origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());

const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});


// get 다건
app.get("/api/v1/todos", async (req, res) => {
    try {
        const { rows } = await pool.query(
            `
            SELECT *
            FROM todo
            ORDER BY id DESC
            `
        );

        res.json({
            resultCode: "S-1",
            msg: "성공",
            data: rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            resultCode: "F-1",
            msg: "에러 발생",
        });
    }
});


// get 단건
app.get("/api/v1/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `
            SELECT *
            FROM todo
            WHERE id = $1
            ORDER BY id DESC
            `,
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({
                resultCode: "F-1",
                msg: "not found",
            });
            return;
        }

        res.json({
            resultCode: "S-1",
            msg: "성공",
            data: rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            resultCode: "F-1",
            msg: "에러 발생",
        });
    }
});

// post 등록
app.post("/api/v1/todos", async (req, res) => {
    try {
        const { content } = req.body;
        const { rows } = await pool.query(
            `
            INSERT INTO todo (created_date, modified_date, content, is_checked)
            VALUES (NOW(), NOW(), $1, false)
            RETURNING *
            `,
            [content]
        );

        res.json({
            resultCode: "S-3",
            msg: "성공",
            data: rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            resultCode: "F-1",
            msg: "에러 발생",
        });
    }
});

// patch 수정
app.patch("/api/v1/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `
            SELECT *
            FROM todo
            WHERE id = $1
            ORDER BY id DESC
            `,
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({
                resultCode: "F-1",
                msg: "not found",
            });
            return;
        }

        const { is_checked } = req.body;

        await pool.query(
            `
            UPDATE todo
            SET modified_date = NOW(),
                is_checked = $1
            WHERE id = $2
            `,
            [is_checked, id]
        );

        res.json({
            resultCode: "S-3",
            msg: "수정성공",
            data: rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            resultCode: "F-1",
            msg: "에러 발생",
        });
    }
});

// delete 삭제
app.delete("/api/v1/todos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `
            SELECT *
            FROM todo
            WHERE id = $1
            ORDER BY id DESC
            `,
            [id]
        );

        if (rows.length === 0) {
            res.status(404).json({
                resultCode: "F-1",
                msg: "not found",
            });
            return;
        }

        await pool.query(
            `
            DELETE FROM todo
            WHERE id = $1
            `,
            [id]
        );

        res.json({
            resultCode: "S-4",
            msg: "삭제성공",
            data: rows[0],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            resultCode: "F-1",
            msg: "에러 발생",
        });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});