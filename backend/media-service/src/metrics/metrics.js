import client from "prom-client";

const register = new client.Registry();

client.collectDefaultMetrics({
    register,
});

const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total HTTP Requests",
    labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests",
    labelNames: ["method", "route", "status"],

    buckets: [
        0.01,
        0.05,
        0.1,
        0.3,
        0.5,
        1,
        2,
        5,
    ],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

export const metricsMiddleware = (req, res, next) => {

    const start = process.hrtime();

    res.on("finish", () => {

        const diff = process.hrtime(start);

        const duration = diff[0] + diff[1] / 1e9;

        httpRequestCounter.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status: res.statusCode,
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route: req.route?.path || req.path,
                status: res.statusCode,
            },
            duration
        );
    });

    next();
};

export const metricsHandler = async (req, res) => {

    res.set("Content-Type", register.contentType);

    res.end(await register.metrics());

};