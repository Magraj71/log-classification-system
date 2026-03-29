/**
 * Sample Log Templates for demo and testing
 * Each sample includes title, icon, description, logData, and optional sourceCode
 */

export const SAMPLE_LOGS = [
  {
    id: "apache-500",
    title: "Apache 500 Error",
    icon: "🌐",
    description: "Internal Server Error from Apache web server",
    category: "ERROR",
    logData: `[Sun Mar 29 14:22:10.123456 2026] [core:error] [pid 29421] [client 192.168.1.105:54321] AH00124: Request exceeded the limit of 10 internal redirects due to probable configuration error. Use 'LimitInternalRecursion' to increase the limit if necessary. Use 'LogLevel debug' to get a backtrace.
[Sun Mar 29 14:22:10.123789 2026] [proxy:error] [pid 29421] (111)Connection refused: AH00957: HTTP: attempt to connect to 127.0.0.1:3000 (localhost) failed
[Sun Mar 29 14:22:10.124001 2026] [proxy_http:error] [pid 29421] [client 192.168.1.105:54321] AH01114: HTTP: failed to make connection to backend: localhost, referer: https://example.com/dashboard
192.168.1.105 - - [29/Mar/2026:14:22:10 +0000] "GET /api/dashboard HTTP/1.1" 500 574 "https://example.com/dashboard" "Mozilla/5.0"`,
    sourceCode: null
  },
  {
    id: "node-typeerror",
    title: "Node.js TypeError",
    icon: "💚",
    description: "Cannot read properties of undefined",
    category: "ERROR",
    logData: `TypeError: Cannot read properties of undefined (reading 'map')
    at UserController.getUsers (/app/src/controllers/userController.js:42:31)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:144:13)
    at authMiddleware (/app/src/middleware/auth.js:28:5)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at /app/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
    at next (/app/node_modules/express/lib/router/index.js:280:10)
    at expressInit (/app/node_modules/express/lib/middleware/init.js:40:5)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)`,
    sourceCode: `// userController.js
const User = require('../models/User');

class UserController {
  async getUsers(req, res) {
    try {
      const users = await User.find({});
      const formatted = users.data.map(u => ({  // BUG: users is already the array, not { data: [...] }
        id: u._id,
        name: u.name,
        email: u.email
      }));
      res.json(formatted);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();`
  },
  {
    id: "python-traceback",
    title: "Python Traceback",
    icon: "🐍",
    description: "Django KeyError in view handler",
    category: "ERROR",
    logData: `Traceback (most recent call last):
  File "/app/venv/lib/python3.11/site-packages/django/core/handlers/exception.py", line 55, in inner
    response = get_response(request)
  File "/app/venv/lib/python3.11/site-packages/django/core/handlers/base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
  File "/app/src/views/analytics.py", line 89, in dashboard_view
    user_stats = compute_user_stats(request.user)
  File "/app/src/services/stats_service.py", line 45, in compute_user_stats
    last_login = user_data['last_login_timestamp']
KeyError: 'last_login_timestamp'

During handling of the above exception, another exception occurred:

  File "/app/src/views/analytics.py", line 92, in dashboard_view
    return JsonResponse({'error': str(e)}, status=500)
TypeError: __str__ returned non-string (type NoneType)`,
    sourceCode: `# stats_service.py
def compute_user_stats(user):
    user_data = get_user_profile(user.id)
    
    # BUG: 'last_login_timestamp' key might not exist for new users
    last_login = user_data['last_login_timestamp']
    
    return {
        'login_count': user_data.get('login_count', 0),
        'last_login': last_login,
        'account_age': calculate_age(user_data['created_at'])
    }`
  },
  {
    id: "mongodb-connection",
    title: "MongoDB Connection Error",
    icon: "🍃",
    description: "Connection timeout and authentication failure",
    category: "ERROR",
    logData: `2026-03-29T14:30:15.234Z ERROR [MongoClient] Connection to mongodb://db-primary.cluster-abc123.us-east-1.docdb.amazonaws.com:27017 timed out after 30000ms
MongoServerSelectionError: connect ETIMEDOUT 10.0.1.45:27017
    at Timeout._onTimeout (/app/node_modules/mongodb/lib/sdam/topology.js:277:38)
    at listOnTimeout (node:internal/timers:581:17)
    at processTimers (node:internal/timers:519:7) {
  reason: TopologyDescription {
    type: 'ReplicaSetNoPrimary',
    servers: Map(3) {
      'db-primary:27017' => ServerDescription { type: 'Unknown', error: MongoNetworkTimeoutError },
      'db-secondary1:27017' => ServerDescription { type: 'Unknown', error: MongoNetworkTimeoutError },
      'db-secondary2:27017' => ServerDescription { type: 'Unknown', error: MongoNetworkTimeoutError }
    }
  },
  code: undefined
}
2026-03-29T14:30:15.235Z FATAL Process exiting with code 1: Unable to connect to database`,
    sourceCode: null
  },
  {
    id: "k8s-crashloop",
    title: "Kubernetes CrashLoop",
    icon: "☸️",
    description: "Pod stuck in CrashLoopBackOff",
    category: "ERROR",
    logData: `kubectl get pods -n production
NAME                              READY   STATUS             RESTARTS      AGE
api-server-7b4d6f8c9-x2k4p      0/1     CrashLoopBackOff   15 (2m ago)   45m
api-server-7b4d6f8c9-m9n3q      0/1     CrashLoopBackOff   15 (3m ago)   45m
worker-5c8d7e6f4-j7h2s          1/1     Running            0             2d

kubectl logs api-server-7b4d6f8c9-x2k4p -n production --previous
2026-03-29T14:00:01Z INFO  Starting API server v2.4.1...
2026-03-29T14:00:01Z INFO  Loading configuration from /etc/config/app.yaml
2026-03-29T14:00:02Z ERROR Config validation failed: required field 'database.connection_string' is missing
2026-03-29T14:00:02Z FATAL Cannot start without valid database configuration. Exiting.

Events:
  Warning  BackOff    2m (x15 over 45m)  kubelet  Back-off restarting failed container
  Warning  Unhealthy  2m                 kubelet  Liveness probe failed: HTTP probe failed with statuscode: 503
  Normal   Pulled     1m (x16 over 45m)  kubelet  Container image "registry.io/api-server:v2.4.1" already present on machine`,
    sourceCode: null
  },
  {
    id: "java-npe",
    title: "Java NullPointerException",
    icon: "☕",
    description: "Spring Boot null reference in service layer",
    category: "ERROR",
    logData: `2026-03-29 14:15:23.456 ERROR 12345 --- [http-nio-8080-exec-7] o.a.c.c.C.[.[.[/].[dispatcherServlet] : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: java.lang.NullPointerException: Cannot invoke "com.example.model.UserProfile.getPreferences()" because the return value of "com.example.service.UserService.findById(java.lang.Long)" is null] with root cause

java.lang.NullPointerException: Cannot invoke "com.example.model.UserProfile.getPreferences()" because the return value of "com.example.service.UserService.findById(java.lang.Long)" is null
\tat com.example.controller.DashboardController.getUserDashboard(DashboardController.java:67)
\tat java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
\tat java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:77)
\tat org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:207)
\tat org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:895)
\tat org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1088)`,
    sourceCode: `// DashboardController.java
@GetMapping("/dashboard")
public ResponseEntity<DashboardResponse> getUserDashboard(@AuthenticationPrincipal User user) {
    // BUG: findById returns null if user not found, but we don't check for null
    UserProfile profile = userService.findById(user.getId());
    List<String> preferences = profile.getPreferences(); // NPE here!
    
    DashboardResponse response = new DashboardResponse();
    response.setPreferences(preferences);
    response.setStats(statsService.compute(user.getId()));
    
    return ResponseEntity.ok(response);
}`
  },
  {
    id: "nginx-502",
    title: "Nginx 502 Bad Gateway",
    icon: "⚙️",
    description: "Upstream connection refused",
    category: "ERROR",
    logData: `2026/03/29 14:25:33 [error] 789#789: *45678 connect() failed (111: Connection refused) while connecting to upstream, client: 203.0.113.50, server: api.example.com, request: "POST /api/v2/users HTTP/2.0", upstream: "http://127.0.0.1:3000/api/v2/users", host: "api.example.com"
2026/03/29 14:25:33 [warn] 789#789: *45678 upstream server temporarily disabled while connecting to upstream, client: 203.0.113.50, server: api.example.com
203.0.113.50 - - [29/Mar/2026:14:25:33 +0000] "POST /api/v2/users HTTP/2.0" 502 166 "https://app.example.com/signup" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
203.0.113.51 - - [29/Mar/2026:14:25:34 +0000] "GET /health HTTP/1.1" 502 166 "-" "kube-probe/1.28"`,
    sourceCode: null
  },
  {
    id: "react-build",
    title: "React Build Error",
    icon: "⚛️",
    description: "Webpack compilation failure with module not found",
    category: "ERROR",
    logData: `Failed to compile.

Module not found: Error: Can't resolve './components/Dashboard/Analytics' in '/app/src/pages'
ERROR in ./src/pages/DashboardPage.jsx 5:0-65
Module not found: Error: Can't resolve './components/Dashboard/Analytics' in '/app/src/pages'

ERROR in ./src/App.jsx 12:0-52
Module not found: Error: Can't resolve './utils/formatDate' in '/app/src/utils'
Did you mean 'dateFormatter'?

webpack 5.91.0 compiled with 2 errors in 3847 ms
error Command failed with exit code 1.`,
    sourceCode: `// DashboardPage.jsx - The import path is wrong
import React from 'react';
import Analytics from './components/Dashboard/Analytics';  // Wrong path!
// Should be: import Analytics from '../components/Dashboard/Analytics';

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Analytics />
    </div>
  );
}`
  },
  {
    id: "warning-memory",
    title: "Memory Usage Warning",
    icon: "⚠️",
    description: "High memory consumption alert",
    category: "WARNING",
    logData: `2026-03-29T14:10:00.000Z WARN  [HealthMonitor] Memory usage at 87% (6.96GB / 8.00GB) on worker-node-7
2026-03-29T14:10:00.001Z WARN  [HealthMonitor] GC pause time exceeded threshold: 450ms (limit: 200ms)
2026-03-29T14:10:15.000Z WARN  [HealthMonitor] Memory usage at 91% (7.28GB / 8.00GB) on worker-node-7
2026-03-29T14:10:15.001Z WARN  [HealthMonitor] Triggering emergency garbage collection
2026-03-29T14:10:16.500Z INFO  [HealthMonitor] Emergency GC completed. Memory usage reduced to 72% (5.76GB / 8.00GB)
2026-03-29T14:10:16.501Z WARN  [HealthMonitor] Memory leak suspected in module 'image-processor'. Accumulated 1.2GB in 6 hours.`,
    sourceCode: null
  },
  {
    id: "info-deploy",
    title: "Successful Deployment",
    icon: "✅",
    description: "Standard deployment success log",
    category: "INFO",
    logData: `2026-03-29T14:00:00.000Z INFO  [DeploymentManager] Starting deployment of service 'api-gateway' v3.2.1
2026-03-29T14:00:01.234Z INFO  [DockerRegistry] Pulling image: registry.io/api-gateway:v3.2.1
2026-03-29T14:00:15.678Z INFO  [DockerRegistry] Image pulled successfully (245MB)
2026-03-29T14:00:16.000Z INFO  [K8sDeployer] Rolling update initiated for deployment/api-gateway
2026-03-29T14:00:30.000Z INFO  [K8sDeployer] Pod api-gateway-6d7f8g9h-abc12 is Running and Ready
2026-03-29T14:00:31.000Z INFO  [K8sDeployer] Pod api-gateway-6d7f8g9h-def34 is Running and Ready
2026-03-29T14:00:32.000Z INFO  [HealthCheck] All 2/2 replicas healthy. Deployment v3.2.1 completed successfully.
2026-03-29T14:00:32.500Z INFO  [MetricsCollector] Deployment duration: 32.5s. Zero-downtime achieved.`,
    sourceCode: null
  }
];
