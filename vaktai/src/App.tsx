import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Úps! Eitthvað fór úrskeiðis</h1>
            <p className="text-gray-600 mb-6">Vinsamlegast endurhlaðið síðuna til að halda áfram</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium"
            >
              🔄 Endurhlaða síðu
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Tæknilegar upplýsingar</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Production API Configuration - Connected to your n8n workflows
const API_CONFIG = {
  AI_CHAT_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/ai-chat',
  AI_SCHEDULE_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/ai-schedule',
  SICK_CALL_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/sick-call',
  SYSTEM_UPDATE_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/system-update',
  WEATHER_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/weather',
  ANALYTICS_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/analytics',
  STAFF_MANAGEMENT_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/staff-management',
  NOTIFICATIONS_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/notifications',
  REPORTS_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/reports',
  TOURS_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/tours',
  EXPORT_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/export',
  BACKUP_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/backup',
  SHIFT_MANAGEMENT_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/shift-management',
  REPLACEMENT_ENDPOINT: 'https://skulitorr.app.n8n.cloud/webhook-test/find-replacement',
  timeout: 15000
};

// Utility function for API calls with comprehensive error handling
const apiCall = async (endpoint, data = {}, method = 'POST') => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    // Log the API call for n8n debugging
    console.log(`📡 API Call to ${endpoint}`, {
      method,
      data,
      timestamp: new Date().toISOString()
    });
    
    // For development/demo, always return mock data to avoid CORS issues
    clearTimeout(timeoutId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    const response = {
      success: true,
      data: getMockDataForEndpoint(endpoint, data),
      mock: true,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ API Response from ${endpoint}`, response);
    
    return response;
    
    /* 
    // Production code for n8n integration:
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ API Response from ${endpoint}`, result);
    return result;
    */
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`❌ API Error [${endpoint}]:`, error);
    
    // Always return mock data on error for demo
    return { 
      success: true, 
      data: getMockDataForEndpoint(endpoint, data),
      mock: true,
      error: error.message 
    };
  }
};

// Mock data generator for demo purposes
const getMockDataForEndpoint = (endpoint, data) => {
  if (endpoint.includes('weather')) {
    return {
      temperature: 8 + Math.floor(Math.random() * 5),
      description: ['Skýjað', 'Sólríkt', 'Rigning', 'Snjókoma'][Math.floor(Math.random() * 4)],
      icon: ['☁️', '☀️', '🌧️', '❄️'][Math.floor(Math.random() * 4)],
      humidity: 65 + Math.floor(Math.random() * 30),
      windSpeed: 10 + Math.floor(Math.random() * 20),
      forecast: [
        { day: 'Mán', temp: 10, icon: '☁️' },
        { day: 'Þri', temp: 8, icon: '🌧️' },
        { day: 'Mið', temp: 12, icon: '☀️' }
      ]
    };
  }
  if (endpoint.includes('analytics')) {
    return {
      efficiency: 94 + Math.floor(Math.random() * 6),
      satisfaction: 85 + Math.floor(Math.random() * 10),
      coverage: 92 + Math.floor(Math.random() * 8),
      costs: -5 - Math.floor(Math.random() * 10),
      trends: {
        weekly: [88, 90, 92, 94, 93, 95, 96],
        monthly: [90, 91, 92, 94]
      }
    };
  }
  if (endpoint.includes('ai-chat')) {
    const responses = [
      'Ég er að greina vaktaplanið. Það vantar 2 starfsmenn á kvöldvakt á morgun.',
      'Ég sé að þú ert með 32 virka starfsmenn. Mæli með að færa Söru í morgunvakt.',
      'Samkvæmt greiningu minni er skilvirkni 96% sem er frábært!',
      'Ég get búið til betra vaktaplan. Viltu að ég taki tillit til frídaga?',
      'Besta lausnin væri að færa Jakob García í kvöldvakt á þriðjudag.',
      'Ég hef fundið 3 starfsmenn sem geta tekið aukavaktir í vikunni.'
    ];
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ['Færa starfsmann', 'Kalla inn aukastarfsmann', 'Breyta vöktum'],
      confidence: 85 + Math.floor(Math.random() * 15)
    };
  }
  if (endpoint.includes('ai-schedule')) {
    return {
      schedule: {
        optimized: true,
        changes: Math.floor(Math.random() * 10) + 5,
        efficiency_gain: Math.floor(Math.random() * 15) + 5,
        conflicts_resolved: Math.floor(Math.random() * 5) + 1,
        suggestions: [
          { staffId: 1, from: 'morning', to: 'evening', day: 'Þriðjudagur' },
          { staffId: 4, from: 'night', to: 'morning', day: 'Miðvikudagur' }
        ]
      }
    };
  }
  if (endpoint.includes('reports')) {
    return {
      reportId: Date.now(),
      status: 'generated',
      url: 'https://example.com/report.pdf'
    };
  }
  if (endpoint.includes('backup')) {
    return {
      backupId: Date.now(),
      status: 'completed',
      size: '2.4MB',
      timestamp: new Date().toISOString()
    };
  }
  if (endpoint.includes('shift-management')) {
    return {
      shiftId: Date.now(),
      status: 'created',
      message: 'Vakt hefur verið búin til'
    };
  }
  if (endpoint.includes('find-replacement')) {
    return {
      replacements: [
        { id: 7, name: 'Jóhanna Guðmundsdóttir', availability: 'full', score: 95 },
        { id: 11, name: 'Nanna Pálsdóttir', availability: 'partial', score: 80 },
        { id: 10, name: 'Magnús Einarsson', availability: 'full', score: 75 }
      ]
    };
  }
  return { success: true, data: {} };
};

// Enhanced Chart Components with Professional Design
const BarChart = ({ data, className, title, onBarClick, animated = true }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  const [hoveredBar, setHoveredBar] = useState(null);
  
  return (
    <div className={className}>
      <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">📊</span>
        {title}
      </h4>
      <svg viewBox="0 0 500 300" className="w-full h-full">
        <defs>
          <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" stopOpacity="0.3"/>
          </filter>
        </defs>
        {data.labels.map((label, index) => {
          const height = (data.datasets[0].data[index] / maxValue) * 180;
          const x = 60 + (index * 55);
          const y = 220 - height;
          const isHovered = hoveredBar === index;
          
          return (
            <g 
              key={label} 
              className="cursor-pointer" 
              onClick={() => onBarClick && onBarClick(label, data.datasets[0].data[index], index)}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <rect 
                x={x} 
                y={220} 
                width="35" 
                height="0" 
                fill={isHovered ? "url(#barGradHover)" : "url(#barGrad)"} 
                rx="4" 
                filter="url(#shadow)"
                className="transition-all duration-300"
                style={{
                  transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom'
                }}
              >
                {animated && (
                  <>
                    <animate 
                      attributeName="height" 
                      from="0" 
                      to={height} 
                      dur="0.8s" 
                      begin={`${index * 0.1}s`}
                      fill="freeze"
                    />
                    <animate 
                      attributeName="y" 
                      from="220" 
                      to={y} 
                      dur="0.8s" 
                      begin={`${index * 0.1}s`}
                      fill="freeze"
                    />
                  </>
                )}
              </rect>
              <text x={x + 17} y={250} textAnchor="middle" className="text-sm fill-gray-600 font-medium">{label}</text>
              <text 
                x={x + 17} 
                y={y - 8} 
                textAnchor="middle" 
                className={`text-sm fill-gray-800 font-bold transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : animated ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {data.datasets[0].data[index]}
                {animated && (
                  <animate 
                    attributeName="opacity" 
                    from="0" 
                    to="1" 
                    dur="0.3s" 
                    begin={`${index * 0.1 + 0.8}s`}
                    fill="freeze"
                  />
                )}
              </text>
              {isHovered && (
                <rect
                  x={x - 10}
                  y={y - 40}
                  width="55"
                  height="25"
                  fill="rgba(0,0,0,0.8)"
                  rx="4"
                  className="animate-fadeIn"
                />
              )}
              {isHovered && (
                <text 
                  x={x + 17} 
                  y={y - 22} 
                  textAnchor="middle" 
                  className="text-xs fill-white animate-fadeIn"
                >
                  {data.datasets[0].data[index]} vaktar
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const LineChart = ({ data, className, title, onPointClick, animated = true }) => {
  const maxValue = Math.max(...data.datasets[0].data);
  const minValue = Math.min(...data.datasets[0].data);
  const range = maxValue - minValue || 1;
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  const points = data.datasets[0].data.map((value, index) => ({
    x: 60 + (index * 70),
    y: 200 - ((value - minValue) / range) * 140
  }));
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className={className}>
      <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">📈</span>
        {title}
      </h4>
      <svg viewBox="0 0 500 300" className="w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path 
          d={`${pathData} L ${points[points.length-1].x} 250 L ${points[0].x} 250 Z`} 
          fill="url(#areaGradient)"
          opacity={animated ? "0" : "1"}
        >
          {animated && (
            <animate 
              attributeName="opacity" 
              from="0" 
              to="1" 
              dur="1s" 
              begin="0.5s"
              fill="freeze"
            />
          )}
        </path>
        <path 
          d={pathData} 
          stroke="url(#lineGradient)" 
          strokeWidth="3" 
          fill="none"
          strokeDasharray={animated ? "1000" : "0"}
          strokeDashoffset={animated ? "1000" : "0"}
        >
          {animated && (
            <animate 
              attributeName="stroke-dashoffset" 
              from="1000" 
              to="0" 
              dur="2s" 
              fill="freeze"
            />
          )}
        </path>
        
        {points.map((point, index) => (
          <g 
            key={index} 
            className="cursor-pointer" 
            onClick={() => onPointClick && onPointClick(data.labels[index], data.datasets[0].data[index], index)}
            onMouseEnter={() => setHoveredPoint(index)}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <circle 
              cx={point.x} 
              cy={point.y} 
              r={animated ? "0" : "6"} 
              fill="white" 
              stroke="url(#lineGradient)" 
              strokeWidth="3" 
              className={`transition-all duration-300 ${hoveredPoint === index ? 'r-8' : ''}`}
            >
              {animated && (
                <animate 
                  attributeName="r" 
                  from="0" 
                  to="6" 
                  dur="0.5s" 
                  begin={`${index * 0.2 + 1}s`}
                  fill="freeze"
                />
              )}
            </circle>
            {hoveredPoint === index && (
              <>
                <rect
                  x={point.x - 30}
                  y={point.y - 40}
                  width="60"
                  height="25"
                  fill="rgba(0,0,0,0.8)"
                  rx="4"
                  className="animate-fadeIn"
                />
                <text 
                  x={point.x} 
                  y={point.y - 22} 
                  textAnchor="middle" 
                  className="text-xs fill-white animate-fadeIn"
                >
                  {data.datasets[0].data[index]}%
                </text>
              </>
            )}
            <text x={point.x} y={270} textAnchor="middle" className="text-sm fill-gray-600 font-medium">{data.labels[index]}</text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const DoughnutChart = ({ data, className, title, onSegmentClick, animated = true }) => {
  const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
  let currentAngle = 0;
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  const [hoveredSegment, setHoveredSegment] = useState(null);
  
  return (
    <div className={className}>
      <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">🥧</span>
        {title}
      </h4>
      <svg viewBox="0 0 280 280" className="w-full h-full">
        <defs>
          {colors.map((color, index) => (
            <radialGradient key={index} id={`donutGrad${index}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={color} />
            </radialGradient>
          ))}
        </defs>
        
        {data.datasets[0].data.map((value, index) => {
          const percentage = (value / total) * 100;
          const angle = (value / total) * 360;
          const startAngle = currentAngle - 90;
          const endAngle = currentAngle + angle - 90;
          currentAngle += angle;

          const radius = 100;
          const innerRadius = 60;
          const centerX = 140;
          const centerY = 140;

          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;

          const x1 = centerX + radius * Math.cos(startAngleRad);
          const y1 = centerY + radius * Math.sin(startAngleRad);
          const x2 = centerX + radius * Math.cos(endAngleRad);
          const y2 = centerY + radius * Math.sin(endAngleRad);

          const x3 = centerX + innerRadius * Math.cos(endAngleRad);
          const y3 = centerY + innerRadius * Math.sin(endAngleRad);
          const x4 = centerX + innerRadius * Math.cos(startAngleRad);
          const y4 = centerY + innerRadius * Math.sin(startAngleRad);

          const largeArcFlag = angle > 180 ? 1 : 0;

          const pathData = [
            "M", x1, y1,
            "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
            "L", x3, y3,
            "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
            "Z"
          ].join(" ");

          const isHovered = hoveredSegment === index;

          return (
            <g 
              key={index} 
              className="cursor-pointer" 
              onClick={() => onSegmentClick && onSegmentClick(data.labels[index], value, percentage)}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <path 
                d={pathData} 
                fill={`url(#donutGrad${index})`}
                className="transition-all duration-300"
                opacity={animated ? "0" : isHovered ? "1" : "0.9"}
                style={{
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: `${centerX}px ${centerY}px`
                }}
              >
                {animated && (
                  <animate 
                    attributeName="opacity" 
                    from="0" 
                    to={isHovered ? "1" : "0.9"} 
                    dur="0.8s" 
                    begin={`${index * 0.2}s`}
                    fill="freeze"
                  />
                )}
              </path>
              <text 
                x={centerX + (radius - 20) * Math.cos((startAngle + angle/2) * Math.PI / 180)}
                y={centerY + (radius - 20) * Math.sin((startAngle + angle/2) * Math.PI / 180)}
                textAnchor="middle"
                className={`text-sm font-bold fill-white transition-opacity duration-300 ${
                  isHovered ? 'opacity-100' : animated ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {percentage.toFixed(0)}%
                {animated && (
                  <animate 
                    attributeName="opacity" 
                    from="0" 
                    to="1" 
                    dur="0.3s" 
                    begin={`${index * 0.2 + 0.8}s`}
                    fill="freeze"
                  />
                )}
              </text>
            </g>
          );
        })}
        
        <circle cx="140" cy="140" r="50" fill="white" />
        <text x="140" y="135" textAnchor="middle" className="text-sm font-medium fill-gray-600">Samtals</text>
        <text x="140" y="155" textAnchor="middle" className="text-xl font-bold fill-gray-900">{total}</text>
        
        {/* Legend */}
        <g transform="translate(20, 20)">
          {data.labels.map((label, index) => (
            <g key={index} transform={`translate(0, ${index * 20})`}>
              <rect x="0" y="0" width="12" height="12" fill={colors[index]} rx="2" />
              <text x="18" y="9" className="text-xs fill-gray-700">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

// Professional Icon Library
const Icons = {
  Calendar: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  Users: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>),
  Brain: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>),
  TrendingUp: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>),
  Clock: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  AlertTriangle: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>),
  Send: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9-7L12 5l-7 7m0 0l7 7m-7-7h9" /></svg>),
  X: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>),
  Plus: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>),
  Download: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>),
  Settings: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  Bell: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>),
  Eye: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" /></svg>),
  Edit: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>),
  Check: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>),
  Filter: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>),
  RefreshCw: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>),
  Print: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>),
  Copy: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
  Phone: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>),
  MessageSquare: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>),
  Cloud: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>),
  Target: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 11H3m16 0h-6m-4-8v6m0 8v6m8-10a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>),
  Activity: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12h4l3-9 4 18 3-9h4" /></svg>),
  Zap: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
  Award: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
  BarChart3: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l3 7 3-7v13m-9 4h12a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>),
  Database: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>),
  FileText: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
  Search: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>),
  Menu: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>),
  Home: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>),
  ChevronDown: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>),
  ChevronLeft: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>),
  ChevronRight: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>),
  ExternalLink: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>),
  MapPin: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
  Mail: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>),
  Info: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Grid: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>),
  List: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>),
  Sparkles: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>),
  Lightning: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
  Shield: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" /></svg>),
  Star: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>),
  Repeat: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 2l4 4-4 4m3.5-4H9a4 4 0 00-4 4v1m2 13l-4-4 4-4m-3.5 4H15a4 4 0 004-4v-1" /></svg>),
  Briefcase: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A8.986 8.986 0 0112 15a8.986 8.986 0 01-9-1.745V19a2 2 0 002 2h14a2 2 0 002-2v-5.745zM16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 6h14a2 2 0 012 2v3a9 9 0 01-18 0V8a2 2 0 012-2z" /></svg>),
  Heart: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>),
  Globe: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
  Trash: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
  UserPlus: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>),
  Save: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" /></svg>),
  Refresh: ({ className }) => (<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>),
};

// Enhanced Toast Component with More Features
const Toast = ({ message, type, onClose, autoClose = true, duration = 4000, actions = [] }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsClosing(true);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'loading': return '⏳';
      default: return '📝';
    }
  };

  const getStyles = () => {
    const base = `fixed bottom-4 right-4 max-w-sm rounded-xl shadow-2xl z-50 border text-white p-4 transform transition-all duration-500 ${
      isClosing ? 'animate-slideOutDown' : 'animate-slideInUp'
    }`;
    switch (type) {
      case 'success': return `${base} bg-gradient-to-r from-green-500 to-emerald-600 border-green-400`;
      case 'error': return `${base} bg-gradient-to-r from-red-500 to-red-600 border-red-400`;
      case 'warning': return `${base} bg-gradient-to-r from-yellow-500 to-amber-600 border-yellow-400`;
      case 'info': return `${base} bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400`;
      case 'loading': return `${base} bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400`;
      default: return `${base} bg-gradient-to-r from-gray-500 to-gray-600 border-gray-400`;
    }
  };

  return (
    <>
      <div className={getStyles()}>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <span className="text-xl mr-3 mt-0.5 animate-bounce">{getIcon()}</span>
            <div className="flex-1">
              <p className="text-sm font-bold leading-5">{message}</p>
              {actions.length > 0 && (
                <div className="flex space-x-2 mt-3">
                  {actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-xs font-medium hover:bg-opacity-30 transition-all transform hover:scale-105"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => {
            setIsClosing(true);
            setTimeout(onClose, 300);
          }} className="ml-3 text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-white hover:bg-opacity-20">
            <Icons.X className="w-4 h-4" />
          </button>
        </div>
        {autoClose && (
          <div className="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all"
              style={{
                width: '0%',
                animation: `progress ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes progress {
          to { width: 100%; }
        }
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideOutDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

// Professional Loading Spinner with Progress
const LoadingSpinner = ({ message = "AI í vinnslu...", progress = 0, subMessage = "", isVisible = true }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl border transform animate-scaleIn">
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Icons.Brain className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-center">
          <span className="ml-2">VaktAI Gervigreind</span>
        </h3>
        <p className="text-gray-600 text-base mb-2 font-medium">{message}{dots}</p>
        {subMessage && <p className="text-gray-500 text-sm mb-4">{subMessage}</p>}
        
        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 shadow-sm relative overflow-hidden"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-xs text-gray-400 mt-4">Vinnsla gagna með fullkominni öryggi 🔒</p>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

// Enhanced Settings Modal with Real Functionality
const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    autoScheduling: false,
    theme: 'light',
    language: 'is',
    emailAlerts: true,
    smsAlerts: false,
    soundNotifications: true,
    autoRefresh: true,
    refreshInterval: 30,
    timezone: 'Atlantic/Reykjavik',
    workingHours: {
      start: '08:00',
      end: '17:00'
    },
    preferences: {
      compactView: false,
      showWeekends: true,
      defaultView: 'week'
    },
    aiSettings: {
      autoSuggestions: true,
      optimizationLevel: 'balanced',
      considerPreferences: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await apiCall(API_CONFIG.SYSTEM_UPDATE_ENDPOINT, {
        action: 'update_user_settings',
        data: settings
      });
      onSave && onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Almennt', icon: Icons.Settings },
    { id: 'appearance', label: 'Útlit', icon: Icons.Eye },
    { id: 'notifications', label: 'Tilkynningar', icon: Icons.Bell },
    { id: 'ai', label: 'AI Stillingar', icon: Icons.Brain },
    { id: 'advanced', label: 'Ítarlegt', icon: Icons.Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Icons.Settings className="w-7 h-7 mr-3 text-blue-600" />
            Kerfisstillingar
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 p-4 border-r">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-2 ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Almennar stillingar</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tilkynningar</label>
                      <p className="text-xs text-gray-500">Fá tilkynningar um breytingar á áætlun</p>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings.notifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                        settings.notifications ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Tungumál</label>
                    <select 
                      value={settings.language}
                      onChange={(e) => setSettings(s => ({ ...s, language: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="is">🇮🇸 Íslenska</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="da">🇩🇰 Dansk</option>
                      <option value="no">🇳🇴 Norsk</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Upphafstími vinnu</label>
                      <input
                        type="time"
                        value={settings.workingHours.start}
                        onChange={(e) => setSettings(s => ({ 
                          ...s, 
                          workingHours: { ...s.workingHours, start: e.target.value }
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Lokatími vinnu</label>
                      <input
                        type="time"
                        value={settings.workingHours.end}
                        onChange={(e) => setSettings(s => ({ 
                          ...s, 
                          workingHours: { ...s.workingHours, end: e.target.value }
                        }))}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Útlit og hegðun</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Þema</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'light', label: '🌞 Ljóst', bg: 'bg-white' },
                        { value: 'dark', label: '🌙 Dökkt', bg: 'bg-gray-800' },
                        { value: 'auto', label: '🔄 Sjálfvirkt', bg: 'bg-gradient-to-r from-white to-gray-800' }
                      ].map(theme => (
                        <button
                          key={theme.value}
                          onClick={() => setSettings(s => ({ ...s, theme: theme.value }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            settings.theme === theme.value
                              ? 'border-blue-500 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-full h-16 rounded ${theme.bg} mb-2`}></div>
                          <p className="text-sm font-medium">{theme.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Sýna helgar</label>
                      <p className="text-xs text-gray-500">Sýna laugardaga og sunnudaga í vaktaplani</p>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ 
                        ...s, 
                        preferences: { ...s.preferences, showWeekends: !s.preferences.showWeekends }
                      }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings.preferences.showWeekends ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                        settings.preferences.showWeekends ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Tilkynningastillingar</h4>
                <div className="space-y-4">
                  {[
                    { key: 'emailAlerts', label: '📧 Tölvupósttilkynningar', desc: 'Fá tilkynningar í tölvupósti' },
                    { key: 'smsAlerts', label: '📱 SMS tilkynningar', desc: 'Fá tilkynningar í síma' },
                    { key: 'soundNotifications', label: '🔔 Hljóðtilkynningar', desc: 'Spila hljóð fyrir mikilvægar tilkynningar' }
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700">{setting.label}</label>
                        <p className="text-xs text-gray-500">{setting.desc}</p>
                      </div>
                      <button
                        onClick={() => setSettings(s => ({ ...s, [setting.key]: !s[setting.key] }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          settings[setting.key] ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                          settings[setting.key] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">AI Stillingar</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">🤖 Sjálfvirkar ábendingar</label>
                      <p className="text-xs text-gray-500">Láta AI gefa ábendingar sjálfkrafa</p>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ 
                        ...s, 
                        aiSettings: { ...s.aiSettings, autoSuggestions: !s.aiSettings.autoSuggestions }
                      }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings.aiSettings.autoSuggestions ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                        settings.aiSettings.autoSuggestions ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">⚡ Bestunaráherslur</label>
                    <select 
                      value={settings.aiSettings.optimizationLevel}
                      onChange={(e) => setSettings(s => ({ 
                        ...s, 
                        aiSettings: { ...s.aiSettings, optimizationLevel: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="efficiency">🎯 Hámarksskilvirkni</option>
                      <option value="balanced">⚖️ Jafnvægi</option>
                      <option value="comfort">😊 Þægindi starfsmanna</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">👤 Taka tillit til óska</label>
                      <p className="text-xs text-gray-500">AI tekur tillit til óska starfsmanna</p>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ 
                        ...s, 
                        aiSettings: { ...s.aiSettings, considerPreferences: !s.aiSettings.considerPreferences }
                      }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings.aiSettings.considerPreferences ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                        settings.aiSettings.considerPreferences ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Ítarlegar stillingar</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">🕐 Tímabelti</label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => setSettings(s => ({ ...s, timezone: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Atlantic/Reykjavik">Reykjavík (GMT)</option>
                      <option value="Europe/London">London (GMT+1)</option>
                      <option value="Europe/Copenhagen">Kaupmannahöfn (GMT+2)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-700">🔄 Sjálfvirk endurnýjun</label>
                      <p className="text-xs text-gray-500">Uppfæra gögn sjálfkrafa</p>
                    </div>
                    <button
                      onClick={() => setSettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                        settings.autoRefresh ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {settings.autoRefresh && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">⏱️ Uppfærslutíðni</label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="range"
                          min="10"
                          max="60"
                          step="10"
                          value={settings.refreshInterval}
                          onChange={(e) => setSettings(s => ({ ...s, refreshInterval: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 w-16 text-right">
                          {settings.refreshInterval} sek
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Athugið</h5>
                    <p className="text-xs text-yellow-700">
                      Ítarlegar stillingar geta haft áhrif á afköst kerfisins. Breyttu aðeins ef þú veist hvað þú ert að gera.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <button 
            onClick={() => {
              setSettings({
                notifications: true,
                autoScheduling: false,
                theme: 'light',
                language: 'is',
                emailAlerts: true,
                smsAlerts: false,
                soundNotifications: true,
                autoRefresh: true,
                refreshInterval: 30,
                timezone: 'Atlantic/Reykjavik',
                workingHours: { start: '08:00', end: '17:00' },
                preferences: { compactView: false, showWeekends: true, defaultView: 'week' },
                aiSettings: { autoSuggestions: true, optimizationLevel: 'balanced', considerPreferences: true }
              });
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            🔄 Endurstilla
          </button>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
              Hætta við
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Vistar...
                </>
              ) : (
                '💾 Vista stillingar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Notifications Modal
const NotificationsModal = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nýr starfsmaður bætt við',
      message: 'Sara Jónsdóttir hefur verið bætt við morgunvaktir í bráðadeild',
      time: '5 mín síðan',
      type: 'info',
      read: false,
      priority: 'normal',
      actions: [
        { label: 'Skoða', action: 'view' },
        { label: 'Samþykkja', action: 'approve' }
      ]
    },
    {
      id: 2,
      title: 'Veikindi tilkynnt',
      message: 'Anna Davíð tilkynnti veikindi fyrir morgundaginn - leita að staðgengil',
      time: '15 mín síðan',
      type: 'warning',
      read: false,
      priority: 'high',
      actions: [
        { label: 'Finna staðgengil', action: 'find_replacement' },
        { label: 'Merkja sem lesið', action: 'mark_read' }
      ]
    },
    {
      id: 3,
      title: 'AI ábending',
      message: 'Ný ábending til að bæta skilvirkni um 12% með endurskipulagningu kvöldvakta',
      time: '1 klst síðan',
      type: 'success',
      read: true,
      priority: 'normal',
      actions: [
        { label: 'Skoða tillögu', action: 'view_suggestion' },
        { label: 'Framkvæma', action: 'implement' }
      ]
    },
    {
      id: 4,
      title: 'Kerfi uppfært',
      message: 'Vaktaáætlun fyrir næstu viku hefur verið búin til og send til starfsfólks',
      time: '2 klst síðan',
      type: 'info',
      read: true,
      priority: 'low',
      actions: []
    },
    {
      id: 5,
      title: 'Yfirvinna viðvörun',
      message: 'Jakob García er að nálgast 50 klst vinnuviku - íhuga að dreifa vöktum',
      time: '3 klst síðan',
      type: 'warning',
      read: false,
      priority: 'medium',
      actions: [
        { label: 'Endurskipuleggja', action: 'reschedule' }
      ]
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter(notification => {
    let matchesFilter = true;
    let matchesSearch = true;

    switch (filter) {
      case 'unread': matchesFilter = !notification.read; break;
      case 'high': matchesFilter = notification.priority === 'high'; break;
      case 'warnings': matchesFilter = notification.type === 'warning'; break;
    }

    if (searchQuery) {
      matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return matchesFilter && matchesSearch;
  });

  const handleNotificationAction = async (notificationId, action) => {
    try {
      await apiCall(API_CONFIG.NOTIFICATIONS_ENDPOINT, {
        action: 'handle_notification_action',
        notificationId,
        actionType: action
      });
      
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      ));
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiCall(API_CONFIG.NOTIFICATIONS_ENDPOINT, {
        action: 'mark_all_read'
      });
      
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'info': return '💬';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Icons.Bell className="w-7 h-7 mr-3 text-blue-600" />
            Tilkynningar
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="ml-3 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full animate-pulse">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="relative flex-1 mr-4">
              <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Leita í tilkynningum..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all transform hover:scale-105"
            >
              ✅ Merkja allar sem lesnar
            </button>
          </div>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: '🔍 Allar', count: notifications.length },
              { key: 'unread', label: '📬 Ólesnar', count: notifications.filter(n => !n.read).length },
              { key: 'high', label: '🚨 Mikilvægar', count: notifications.filter(n => n.priority === 'high').length },
              { key: 'warnings', label: '⚠️ Viðvaranir', count: notifications.filter(n => n.type === 'warning').length }
            ].map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => setFilter(filterOption.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                  filter === filterOption.key
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filterOption.label} ({filterOption.count})
              </button>
            ))}
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh]">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Icons.Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Engar tilkynningar að sýna</p>
              {searchQuery && (
                <p className="text-gray-400 text-sm mt-2">Engar tilkynningar fundust með "{searchQuery}"</p>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-6 border-b hover:bg-gray-50 transition-all ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                } animate-fadeIn`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="text-2xl mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{notification.title}</h4>
                        {notification.priority === 'high' && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full animate-pulse">
                            BRÁÐ
                          </span>
                        )}
                        {!notification.read && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                            NÝ
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{notification.message}</p>
                      <p className="text-sm text-gray-500 mb-4 flex items-center">
                        <Icons.Clock className="w-3 h-3 mr-1" />
                        {notification.time}
                      </p>
                      
                      {notification.actions.length > 0 && (
                        <div className="flex space-x-2">
                          {notification.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleNotificationAction(notification.id, action.action)}
                              className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Eyða tilkynningu"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Sýnir {filteredNotifications.length} af {notifications.length} tilkynningum</span>
            <span className="flex items-center">
              <Icons.RefreshCw className="w-3 h-3 mr-1" />
              Síðast uppfært: {new Date().toLocaleTimeString('is-IS')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Add Staff Modal with Validation
const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    skills: [],
    workType: 'full_time',
    startDate: new Date().toISOString().split('T')[0],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    preferences: {
      morningShifts: true,
      eveningShifts: true,
      nightShifts: false,
      weekends: true
    },
    certifications: [],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const availableSkills = [
    'Hjúkrun', 'Læknisfræði', 'Bráðalæknisfræði', 'Skurðlæknisfræði', 
    'Lyfjafræði', 'Geðheilbrigði', 'Barnalæknisfræði', 'Ellivist',
    'Endurhæfing', 'Stjórnun', 'Þjálfun', 'Tækniþjónusta'
  ];

  const steps = [
    { title: 'Persónuupplýsingar', icon: Icons.Users },
    { title: 'Starfsupplýsingar', icon: Icons.Briefcase },
    { title: 'Hæfni og vaktir', icon: Icons.Award },
    { title: 'Yfirlit', icon: Icons.Check }
  ];

  if (!isOpen) return null;

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Fornafn er krafist';
      if (!formData.lastName.trim()) newErrors.lastName = 'Eftirnafn er krafist';
      if (!formData.email.trim()) newErrors.email = 'Netfang er krafist';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Ógilt netfang';
      if (!formData.phone.trim()) newErrors.phone = 'Símanúmer er krafist';
    } else if (step === 1) {
      if (!formData.role.trim()) newErrors.role = 'Hlutverk er krafist';
      if (!formData.department) newErrors.department = 'Deild er krafist';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setLoading(true);
    try {
      const newStaff = {
        id: Date.now(),
        ...formData,
        fullName: `${formData.firstName} ${formData.lastName}`,
        name: `${formData.firstName} ${formData.lastName}`,
        sick: false,
        lead: false,
        createdAt: new Date().toISOString()
      };

      await apiCall(API_CONFIG.STAFF_MANAGEMENT_ENDPOINT, {
        action: 'add_staff',
        staffData: newStaff
      });

      onAddStaff(newStaff);
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', role: '', department: '', skills: [],
        workType: 'full_time', startDate: new Date().toISOString().split('T')[0],
        emergencyContact: { name: '', phone: '', relationship: '' },
        preferences: { morningShifts: true, eveningShifts: true, nightShifts: false, weekends: true },
        certifications: [], notes: ''
      });
      setActiveStep(0);
      onClose();
    } catch (error) {
      console.error('Failed to add staff:', error);
      setErrors({ submit: 'Villa við að bæta við starfsmanni. Reyndu aftur.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Icons.Users className="w-7 h-7 mr-3 text-green-600" />
            Bæta við nýjum starfsmanni
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center p-4 bg-gray-50 border-b">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                index === activeStep 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : index < activeStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < activeStep ? (
                  <Icons.Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index === activeStep ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-3 rounded ${
                  index < activeStep ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeStep === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icons.Users className="w-5 h-5 mr-2" />
                Persónuupplýsingar
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fornafn *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(s => ({ ...s, firstName: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.firstName ? 'border-red-500' : ''}`}
                    placeholder="T.d. Sara"
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Eftirnafn *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(s => ({ ...s, lastName: e.target.value }))}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.lastName ? 'border-red-500' : ''}`}
                    placeholder="T.d. Jónsdóttir"
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Netfang *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(s => ({ ...s, email: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="sara.jonsdottir@hospital.is"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Símanúmer *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(s => ({ ...s, phone: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+354 555 0000"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div className="border-t pt-4">
                <h5 className="text-md font-semibold text-gray-900 mb-4">Neyðarsamband</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nafn</label>
                    <input
                      type="text"
                      value={formData.emergencyContact.name}
                      onChange={(e) => setFormData(s => ({ 
                        ...s, 
                        emergencyContact: { ...s.emergencyContact, name: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nafn á neyðarsambandi"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Símanúmer</label>
                    <input
                      type="tel"
                      value={formData.emergencyContact.phone}
                      onChange={(e) => setFormData(s => ({ 
                        ...s, 
                        emergencyContact: { ...s.emergencyContact, phone: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="+354 555 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tengsl</label>
                    <select
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => setFormData(s => ({ 
                        ...s, 
                        emergencyContact: { ...s.emergencyContact, relationship: e.target.value }
                      }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Veldu tengsl</option>
                      <option value="spouse">Maki</option>
                      <option value="parent">Foreldri</option>
                      <option value="sibling">Systkini</option>
                      <option value="child">Barn</option>
                      <option value="friend">Vinur</option>
                      <option value="other">Annað</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icons.Briefcase className="w-5 h-5 mr-2" />
                Starfsupplýsingar
              </h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hlutverk *</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData(s => ({ ...s, role: e.target.value }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${errors.role ? 'border-red-500' : ''}`}
                  placeholder="T.d. Hjúkrunarfræðingur, Læknir"
                />
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deild *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Bráðadeild', label: '🚨 Bráðadeild', desc: 'Neyðarþjónusta og bráðahjúkrun' },
                    { value: 'Skurðdeild', label: '🏥 Skurðdeild', desc: 'Skurðstofur og eftirlit' },
                    { value: 'Barnadeild', label: '👶 Barnadeild', desc: 'Barnalækningar og umönnun' },
                    { value: 'Hjartadeild', label: '❤️ Hjartadeild', desc: 'Hjartasjúkdómar' },
                    { value: 'Geisladeild', label: '📷 Geisladeild', desc: 'Myndgreining og geislameðferð' },
                    { value: 'Rannsóknarstofa', label: '🧪 Rannsóknarstofa', desc: 'Blóðrannsóknir og greiningar' }
                  ].map(dept => (
                    <button
                      key={dept.value}
                      onClick={() => setFormData(s => ({ ...s, department: dept.value }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all transform hover:scale-105 ${
                        formData.department === dept.value
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold">{dept.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{dept.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Starfshlutfall</label>
                  <select
                    value={formData.workType}
                    onChange={(e) => setFormData(s => ({ ...s, workType: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">💼 Fullt starf (100%)</option>
                    <option value="part_time_75">⏰ Hlutastarf (75%)</option>
                    <option value="part_time_50">⏰ Hlutastarf (50%)</option>
                    <option value="contract">📄 Verktaki</option>
                    <option value="temporary">🔄 Tímabundið</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upphafsdagur</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(s => ({ ...s, startDate: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Athugasemdir</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(s => ({ ...s, notes: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Sérstakar athugasemdir um starfsmann..."
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icons.Award className="w-5 h-5 mr-2" />
                Hæfni og vaktaval
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hæfni og reynsla</label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border rounded-lg bg-gray-50">
                  {availableSkills.map(skill => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded transition-all">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Veldu allar hæfnir sem eiga við</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vaktaval</label>
                <div className="space-y-3">
                  {[
                    { key: 'morningShifts', label: '🌅 Morgunvaktir (08:00-16:00)', desc: 'Getur unnið morgunvaktir' },
                    { key: 'eveningShifts', label: '🌆 Kvöldvaktir (16:00-00:00)', desc: 'Getur unnið kvöldvaktir' },
                    { key: 'nightShifts', label: '🌙 Næturvaktir (00:00-08:00)', desc: 'Getur unnið næturvaktir' },
                    { key: 'weekends', label: '📅 Helgarvaktir', desc: 'Getur unnið um helgar' }
                  ].map(pref => (
                    <div key={pref.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                      <div>
                        <p className="font-medium">{pref.label}</p>
                        <p className="text-xs text-gray-600">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => setFormData(s => ({ 
                          ...s, 
                          preferences: { ...s.preferences, [pref.key]: !s.preferences[pref.key] }
                        }))}
                        className={`relative w-14 h-7 rounded-full transition-colors ${
                          formData.preferences[pref.key] ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                          formData.preferences[pref.key] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="text-sm font-semibold text-blue-800 mb-2">💡 Ábending</h5>
                <p className="text-xs text-blue-700">
                  Starfsmenn sem geta unnið fleiri tegundir vakta auka sveigjanleika í vaktaskipulagi og geta fengið betri vaktir.
                </p>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Icons.Check className="w-5 h-5 mr-2" />
                Yfirlit
              </h4>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-4">Staðfesta upplýsingar</h5>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Persónuupplýsingar</h6>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Nafn:</dt>
                        <dd className="text-sm font-medium">{formData.firstName} {formData.lastName}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Netfang:</dt>
                        <dd className="text-sm font-medium">{formData.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Sími:</dt>
                        <dd className="text-sm font-medium">{formData.phone}</dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Starfsupplýsingar</h6>
                    <dl className="space-y-1">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Hlutverk:</dt>
                        <dd className="text-sm font-medium">{formData.role}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Deild:</dt>
                        <dd className="text-sm font-medium">{formData.department}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Starfshlutfall:</dt>
                        <dd className="text-sm font-medium">
                          {formData.workType === 'full_time' ? '100%' :
                           formData.workType === 'part_time_75' ? '75%' :
                           formData.workType === 'part_time_50' ? '50%' :
                           formData.workType === 'contract' ? 'Verktaki' :
                           'Tímabundið'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
                
                {formData.skills.length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-sm font-semibold text-gray-700 mb-2">Hæfni</h6>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h6 className="text-sm font-semibold text-gray-700 mb-2">Vaktaval</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'morningShifts', label: '🌅 Morgunvaktir' },
                      { key: 'eveningShifts', label: '🌆 Kvöldvaktir' },
                      { key: 'nightShifts', label: '🌙 Næturvaktir' },
                      { key: 'weekends', label: '📅 Helgar' }
                    ].map(pref => formData.preferences[pref.key] && (
                      <span key={pref.key} className="text-sm text-green-600 font-medium">
                        ✓ {pref.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
                <p className="text-sm text-green-800">
                  ✅ Allar upplýsingar tilbúnar. Smelltu á "Bæta við starfsmanni" til að ljúka skráningu.
                </p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t bg-gray-50">
          <button 
            onClick={handlePrevious}
            disabled={activeStep === 0}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Til baka
          </button>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
              Hætta við
            </button>
            {activeStep < steps.length - 1 ? (
              <button 
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center transform hover:scale-105"
              >
                Áfram →
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 flex items-center transform hover:scale-105"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Bætir við...
                  </>
                ) : (
                  <>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Bæta við starfsmanni
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Add/Edit Shift Modal
const ShiftModal = ({ isOpen, onClose, onSave, shift, staff, day, staffMember }) => {
  const [formData, setFormData] = useState({
    type: shift?.type || 'morning',
    department: shift?.department || staffMember?.department || 'Bráðadeild',
    staffId: shift?.staffId || staffMember?.id || '',
    day: shift?.day || day || 'Mánudagur',
    notes: shift?.notes || '',
    requiredSkills: shift?.requiredSkills || [],
    priority: shift?.priority || 'normal'
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const shiftData = {
        ...formData,
        id: shift?.id || Date.now(),
        updatedAt: new Date().toISOString()
      };

      await apiCall(API_CONFIG.SHIFT_MANAGEMENT_ENDPOINT, {
        action: shift ? 'update_shift' : 'create_shift',
        shiftData
      });

      onSave(shiftData);
      onClose();
    } catch (error) {
      console.error('Failed to save shift:', error);
    } finally {
      setLoading(false);
    }
  };

  const shiftTypes = [
    { id: 'morning', label: '🌅 Morgunvakt', time: '08:00-16:00' },
    { id: 'evening', label: '🌆 Kvöldvakt', time: '16:00-00:00' },
    { id: 'night', label: '🌙 Næturvakt', time: '00:00-08:00' },
    { id: 'overtime', label: '⏰ Aukavakt', time: 'Sérsniðin' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full mx-4 shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Icons.Calendar className="w-6 h-6 mr-2 text-blue-600" />
            {shift ? 'Breyta vakt' : 'Bæta við vakt'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tegund vaktar</label>
            <div className="grid grid-cols-2 gap-2">
              {shiftTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setFormData(s => ({ ...s, type: type.id }))}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    formData.type === type.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">{type.label}</p>
                  <p className="text-xs text-gray-600">{type.time}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Starfsmaður</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData(s => ({ ...s, staffId: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!!staffMember}
            >
              {!staffMember && <option value="">Veldu starfsmann</option>}
              {staff.filter(s => !s.sick).map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deild</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(s => ({ ...s, department: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bráðadeild">🚨 Bráðadeild</option>
              <option value="Skurðdeild">🏥 Skurðdeild</option>
              <option value="Barnadeild">👶 Barnadeild</option>
              <option value="Hjartadeild">❤️ Hjartadeild</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Forgangsröðun</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(s => ({ ...s, priority: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">🟢 Lágur forgangur</option>
              <option value="normal">🟡 Venjulegur forgangur</option>
              <option value="high">🔴 Hár forgangur</option>
              <option value="critical">🚨 Mjög mikilvægt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Athugasemdir</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(s => ({ ...s, notes: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-20"
              placeholder="Sérstakar athugasemdir fyrir þessa vakt..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Hætta við
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || !formData.staffId}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 flex items-center transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Vistar...
              </>
            ) : (
              <>
                <Icons.Save className="w-4 h-4 mr-2" />
                Vista vakt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Replacement Finder Modal
const ReplacementModal = ({ isOpen, onClose, sickStaff, shifts, staff, onSelectReplacement }) => {
  const [availableStaff, setAvailableStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  useEffect(() => {
    if (isOpen && sickStaff) {
      findReplacements();
    }
  }, [isOpen, sickStaff]);

  const findReplacements = async () => {
    setLoading(true);
    try {
      const response = await apiCall(API_CONFIG.REPLACEMENT_ENDPOINT, {
        sickStaffId: sickStaff.id,
        department: sickStaff.department,
        date: new Date().toISOString()
      });

      setAvailableStaff(response.data.replacements || []);
    } catch (error) {
      console.error('Failed to find replacements:', error);
      setAvailableStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReplacement = async () => {
    if (!selectedStaffId) return;

    const replacement = staff.find(s => s.id === selectedStaffId);
    if (replacement) {
      onSelectReplacement(replacement);
      onClose();
    }
  };

  if (!isOpen || !sickStaff) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Icons.Users className="w-6 h-6 mr-2 text-orange-600" />
            Finna staðgengil fyrir {sickStaff.name}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              <strong>{sickStaff.name}</strong> hefur tilkynnt veikindi. 
              Hér að neðan eru starfsmenn sem geta tekið við vöktum.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Leitar að tiltækum starfsmönnum...</p>
            </div>
          ) : availableStaff.length === 0 ? (
            <div className="text-center py-12">
              <Icons.AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
              <p className="text-gray-600 text-lg">Enginn starfsmaður tiltækur í þessari deild</p>
              <p className="text-gray-500 text-sm mt-2">Íhugaðu að færa starfsmann úr annarri deild</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableStaff.map(replacement => {
                const staffInfo = staff.find(s => s.id === replacement.id);
                return (
                  <div
                    key={replacement.id}
                    onClick={() => setSelectedStaffId(replacement.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedStaffId === replacement.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          replacement.availability === 'full' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}>
                          {staffInfo?.name?.split(' ').map(n => n[0]).join('') || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{staffInfo?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{staffInfo?.role || ''} • {staffInfo?.department || ''}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {replacement.availability === 'full' 
                              ? '✅ Fullkomlega tiltækur' 
                              : '⚠️ Takmarkað tiltækur'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{replacement.score}%</p>
                        <p className="text-xs text-gray-500">Match score</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Hætta við
          </button>
          <button 
            onClick={handleSelectReplacement}
            disabled={!selectedStaffId}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all font-medium disabled:opacity-50 flex items-center transform hover:scale-105"
          >
            <Icons.UserPlus className="w-4 h-4 mr-2" />
            Velja staðgengil
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Tour Modal
const AddTourModal = ({ isOpen, onClose, onAddTour }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'day',
    time: '09:00-17:00',
    requiresLicence: '',
    requiredStaff: 2,
    description: '',
    location: '',
    capacity: 20,
    price: 0,
    duration: 8,
    requirements: [],
    difficulty: 'easy',
    included: [],
    meetingPoint: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const tourTypes = [
    { value: 'day', label: '🌞 Dagferð', desc: 'Hefðbundin dagferð' },
    { value: 'evening', label: '🌆 Kvöldferð', desc: 'Kvöldferð með mat' },
    { value: 'private', label: '🎯 Einkaferð', desc: 'Sérsniðin ferð' },
    { value: 'northern_lights', label: '🌌 Norðurljós', desc: 'Norðurljósaferð' },
    { value: 'glacier', label: '🏔️ Jöklaferð', desc: 'Jöklaganga' },
    { value: 'whale', label: '🐋 Hvalaskoðun', desc: 'Hvalaskoðunarferð' }
  ];

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nafn ferðar er krafist';
    if (formData.requiredStaff < 1) newErrors.requiredStaff = 'Fjöldi starfsmanna verður að vera 1 eða fleiri';
    if (formData.capacity < 1) newErrors.capacity = 'Hámarksfjöldi verður að vera 1 eða fleiri';
    if (!formData.location.trim()) newErrors.location = 'Staðsetning er krafist';
    if (!formData.meetingPoint.trim()) newErrors.meetingPoint = 'Söfnunarstaður er krafist';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newTour = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };

      await apiCall(API_CONFIG.TOURS_ENDPOINT, {
        action: 'add_tour',
        tourData: newTour
      });

      onAddTour(newTour);
      setFormData({
        name: '', type: 'day', time: '09:00-17:00', requiresLicence: '', requiredStaff: 2,
        description: '', location: '', capacity: 20, price: 0, duration: 8,
        requirements: [], difficulty: 'easy', included: [], meetingPoint: ''
      });
      onClose();
    } catch (error) {
      console.error('Failed to add tour:', error);
      setErrors({ submit: 'Villa við að bæta við ferð. Reyndu aftur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Icons.MapPin className="w-7 h-7 mr-3 text-cyan-600" />
            Bæta við nýrri ferð
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nafn ferðar *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(s => ({ ...s, name: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="T.d. Gullni hringurinn - Deluxe"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tegund ferðar</label>
              <div className="grid grid-cols-3 gap-3">
                {tourTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData(s => ({ ...s, type: type.value }))}
                    className={`p-4 rounded-lg border-2 text-left transition-all transform hover:scale-105 ${
                      formData.type === type.value
                        ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold">{type.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tímasetning</label>
                <input
                  type="text"
                  value={formData.time}
                  onChange={(e) => setFormData(s => ({ ...s, time: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="09:00-17:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Erfiðleikastig</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(s => ({ ...s, difficulty: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">🟢 Auðvelt</option>
                  <option value="moderate">🟡 Miðlungs</option>
                  <option value="challenging">🟠 Krefjandi</option>
                  <option value="difficult">🔴 Erfitt</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fjöldi starfsmanna *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.requiredStaff}
                  onChange={(e) => setFormData(s => ({ ...s, requiredStaff: parseInt(e.target.value) || 1 }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.requiredStaff ? 'border-red-500' : ''}`}
                />
                {errors.requiredStaff && <p className="text-red-500 text-xs mt-1">{errors.requiredStaff}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hámarksfjöldi *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(s => ({ ...s, capacity: parseInt(e.target.value) || 1 }))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.capacity ? 'border-red-500' : ''}`}
                />
                {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lengd (klst)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(s => ({ ...s, duration: parseInt(e.target.value) || 1 }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verð (ISK)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(s => ({ ...s, price: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="15000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kröfur um réttindi</label>
                <select
                  value={formData.requiresLicence}
                  onChange={(e) => setFormData(s => ({ ...s, requiresLicence: e.target.value }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Engin sérstök réttindi</option>
                  <option value="tour_guide">🎯 Leiðsöguréttindi</option>
                  <option value="driver_d">🚌 D-réttindi (rútur)</option>
                  <option value="first_aid">🏥 Skyndihjálp</option>
                  <option value="glacier_guide">🏔️ Jöklaleiðsöguréttindi</option>
                  <option value="boat">⛵ Skipstjórnarréttindi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Staðsetning *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(s => ({ ...s, location: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.location ? 'border-red-500' : ''}`}
                placeholder="T.d. Suðurland, Snæfellsnes"
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Söfnunarstaður *</label>
              <input
                type="text"
                value={formData.meetingPoint}
                onChange={(e) => setFormData(s => ({ ...s, meetingPoint: e.target.value }))}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.meetingPoint ? 'border-red-500' : ''}`}
                placeholder="T.d. BSÍ, Hallgrímskirkja, Hótel"
              />
              {errors.meetingPoint && <p className="text-red-500 text-xs mt-1">{errors.meetingPoint}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Innifalið í ferð</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'transport', label: '🚌 Akstur' },
                  { id: 'guide', label: '🎯 Leiðsögn' },
                  { id: 'food', label: '🍽️ Matur' },
                  { id: 'equipment', label: '🎿 Búnaður' },
                  { id: 'entrance', label: '🎟️ Aðgangseyrir' },
                  { id: 'insurance', label: '🛡️ Trygging' }
                ].map(item => (
                  <label key={item.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.included.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(s => ({ ...s, included: [...s.included, item.id] }));
                        } else {
                          setFormData(s => ({ ...s, included: s.included.filter(i => i !== item.id) }));
                        }
                      }}
                      className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-sm">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lýsing</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Lýsing á ferðinni, hvað er innifalið, áhugaverðir staðir..."
              />
            </div>
          </div>

          {errors.submit && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors">
            Hætta við
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 flex items-center transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Bætir við...
              </>
            ) : (
              <>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Bæta við ferð
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Staff Details Modal with Comprehensive Information
const StaffDetailsModal = ({ isOpen, onClose, staff, onReportSick, onEditStaff, onDeleteStaff }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(null);

  if (!isOpen || !staff) return null;

  const getTotalHours = () => {
    return 38 + Math.floor(Math.random() * 5);
  };

  const getUpcomingShifts = () => {
    return [
      { date: '2025-05-24', shift: 'Morgunvakt', hours: '08:00-16:00', department: 'Bráðadeild', status: 'confirmed' },
      { date: '2025-05-25', shift: 'Kvöldvakt', hours: '16:00-00:00', department: 'Bráðadeild', status: 'confirmed' },
      { date: '2025-05-27', shift: 'Morgunvakt', hours: '08:00-16:00', department: 'Skurðdeild', status: 'pending' },
      { date: '2025-05-28', shift: 'Morgunvakt', hours: '08:00-16:00', department: 'Bráðadeild', status: 'confirmed' },
      { date: '2025-05-30', shift: 'Kvöldvakt', hours: '16:00-00:00', department: 'Bráðadeild', status: 'confirmed' }
    ];
  };

  const getPerformanceMetrics = () => {
    return {
      punctuality: 96 + Math.floor(Math.random() * 4),
      teamwork: 92 + Math.floor(Math.random() * 8),
      skills: 89 + Math.floor(Math.random() * 11),
      patient_satisfaction: 94 + Math.floor(Math.random() * 6),
      efficiency: 91 + Math.floor(Math.random() * 9),
      communication: 93 + Math.floor(Math.random() * 7)
    };
  };

  const getAttendanceRecord = () => {
    return {
      present: 218,
      sick: 12,
      vacation: 15,
      other: 5
    };
  };

  const saveNotes = async () => {
    setLoading(true);
    try {
      await apiCall(API_CONFIG.STAFF_MANAGEMENT_ENDPOINT, {
        action: 'add_note',
        staffId: staff.id,
        note: {
          text: notes,
          author: 'Current User',
          timestamp: new Date().toISOString()
        }
      });
      setNotes('');
      setShowToast({ message: 'Athugasemd vistuð', type: 'success' });
    } catch (error) {
      console.error('Failed to save note:', error);
      setShowToast({ message: 'Villa við að vista athugasemd', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn no-print" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl transform animate-scaleIn" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <Icons.Users className="w-7 h-7 mr-3 text-purple-600" />
              {staff.fullName || staff.name}
              {staff.lead && <span className="ml-2 text-yellow-600">👑</span>}
              {staff.sick && <span className="ml-2 text-red-600">🤒</span>}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {staff.role || 'Hjúkrunarfræðingur'} • {staff.department || 'Bráðadeild'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex border-b bg-gray-50">
          {[
            { id: 'info', label: 'Upplýsingar', icon: Icons.Info },
            { id: 'schedule', label: 'Vaktaplan', icon: Icons.Calendar },
            { id: 'stats', label: 'Tölfræði', icon: Icons.BarChart3 },
            { id: 'performance', label: 'Frammistaða', icon: Icons.Award },
            { id: 'notes', label: 'Athugasemdir', icon: Icons.FileText },
            { id: 'history', label: 'Saga', icon: Icons.Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 flex items-center justify-center space-x-2 font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'info' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                    <Icons.Users className="w-5 h-5 mr-2 text-blue-600" />
                    Persónuupplýsingar
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fullt nafn:</span>
                      <span className="font-medium">{staff.fullName || staff.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Netfang:</span>
                      <span className="font-medium">{staff.email || `${(staff.name || staff.fullName || 'notandi').toLowerCase().replace(/\s+/g, '.')}@hospital.is`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sími:</span>
                      <span className="font-medium">{staff.phone || '+354 555 ' + Math.floor(1000 + Math.random() * 9000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kennitala:</span>
                      <span className="font-medium">{Math.floor(100000 + Math.random() * 900000)}-{Math.floor(1000 + Math.random() * 9000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heimilisfang:</span>
                      <span className="font-medium">Laugavegur {Math.floor(1 + Math.random() * 100)}, 101 Reykjavík</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 flex items-center mb-4">
                    <Icons.Briefcase className="w-5 h-5 mr-2 text-green-600" />
                    Starfsupplýsingar
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deild:</span>
                      <span className="font-medium">{staff.department || 'Bráðadeild'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hlutverk:</span>
                      <span className="font-medium">{staff.role || 'Hjúkrunarfræðingur'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starfshlutfall:</span>
                      <span className="font-medium">
                        {staff.workType === 'full_time' ? '100%' : '50-75%'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upphafsdagur:</span>
                      <span className="font-medium">{staff.startDate || '15. janúar 2020'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Staða:</span>
                      <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                        staff.sick ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {staff.sick ? '🤒 Veikur/Veik' : '✅ Virkur'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Starfsaldur:</span>
                      <span className="font-medium">{Math.floor(Math.random() * 10) + 1} ár</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Icons.Zap className="w-5 h-5 mr-2 text-purple-600" />
                  Hæfni og réttindi
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {(staff.skills || ['Hjúkrun', 'Bráðalæknisfræði', 'Lyfjafræði', 'Skyndihjálp', 'Stjórnun']).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Icons.Award className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">Hjúkrunarleyfi - Gild til 2027</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icons.Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Skyndihjálp - Gild til 2026</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Icons.Phone className="w-5 h-5 mr-2 text-orange-600" />
                  Neyðarsamband
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nafn</p>
                    <p className="font-medium">{staff.emergencyContact?.name || 'Jón Jónsson'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sími</p>
                    <p className="font-medium">{staff.emergencyContact?.phone || '+354 555 2000'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tengsl</p>
                    <p className="font-medium">{staff.emergencyContact?.relationship || 'Maki'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Netfang</p>
                    <p className="font-medium">jon.jonsson@email.is</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Vinnustundir þessa viku</p>
                    <p className="text-2xl font-bold text-blue-600">{getTotalHours()} klst</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Yfirvinna</p>
                    <p className="text-2xl font-bold text-orange-600">{Math.floor(Math.random() * 5)} klst</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Næsta frí</p>
                    <p className="text-2xl font-bold text-green-600">Lau-Sun</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Icons.Calendar className="w-5 h-5 mr-2" />
                  Næstu vaktir
                </h4>
                <div className="space-y-2">
                  {getUpcomingShifts().map((shift, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-16 rounded-full ${
                          shift.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(shift.date).toLocaleDateString('is-IS', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </p>
                          <p className="text-sm text-gray-600">{shift.shift} - {shift.department}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {shift.status === 'confirmed' ? '✅ Staðfest' : '⏳ Í bið'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{shift.hours}</p>
                        <p className="text-sm text-gray-600">8 klst</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-3">Æskilegar vaktir</h5>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li className="flex items-center"><Icons.Check className="w-4 h-4 mr-2" /> Morgunvaktir</li>
                    <li className="flex items-center"><Icons.Check className="w-4 h-4 mr-2" /> Kvöldvaktir</li>
                    <li className="flex items-center"><Icons.Check className="w-4 h-4 mr-2" /> Helgarvaktir</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-lg">
                  <h5 className="font-medium text-red-800 mb-3">Forðast vaktir</h5>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li className="flex items-center"><Icons.X className="w-4 h-4 mr-2" /> Næturvaktir</li>
                    <li className="flex items-center"><Icons.X className="w-4 h-4 mr-2" /> Stórhátíðir</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Ábending:</strong> Starfsmaður hefur sveigjanleika til að taka aukavaktir ef þörf krefur.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Vaktir í mánuði', value: 156 + Math.floor(Math.random() * 20), icon: '📅', color: 'blue' },
                  { label: 'Mætingahlutfall', value: `${98 - Math.floor(Math.random() * 3)}%`, icon: '✅', color: 'green' },
                  { label: 'Veikindadagar', value: 3 + Math.floor(Math.random() * 5), icon: '🤒', color: 'red' },
                  { label: 'Mat frá stjórnendum', value: `4.${8 - Math.floor(Math.random() * 3)}/5`, icon: '⭐', color: 'yellow' }
                ].map((stat, index) => (
                  <div key={index} className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 p-4 rounded-lg text-center transform hover:scale-105 transition-all`}>
                    <p className="text-3xl mb-2">{stat.icon}</p>
                    <p className={`text-2xl font-bold text-${stat.color}-700`}>{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <BarChart
                  data={{
                    labels: ['Mán', 'Þri', 'Mið', 'Fim', 'Fös'],
                    datasets: [{
                      data: [8, 8, 6, 8, 7].map(h => h + Math.floor(Math.random() * 3))
                    }]
                  }}
                  title="Vinnustundir í vikunni"
                  className="h-64"
                />

                <DoughnutChart
                  data={{
                    labels: ['Morgunvaktir', 'Kvöldvaktir', 'Helgarvaktir', 'Yfirvinna'],
                    datasets: [{
                      data: [45, 30, 15, 10]
                    }]
                  }}
                  title="Vaktadreifing"
                  className="h-64"
                />
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Mætingarsaga</h4>
                <div className="bg-white border rounded-lg p-4">
                  <div className="space-y-3">
                    {getAttendanceRecord() && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Mættur:</span>
                          <div className="flex items-center">
                            <div className="w-48 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                              <div className="bg-green-500 h-3 rounded-full" style={{ width: '87%' }}></div>
                            </div>
                            <span className="text-sm font-medium">218 dagar (87%)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Veikindi:</span>
                          <div className="flex items-center">
                            <div className="w-48 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                              <div className="bg-red-500 h-3 rounded-full" style={{ width: '5%' }}></div>
                            </div>
                            <span className="text-sm font-medium">12 dagar (5%)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Frí:</span>
                          <div className="flex items-center">
                            <div className="w-48 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                              <div className="bg-blue-500 h-3 rounded-full" style={{ width: '6%' }}></div>
                            </div>
                            <span className="text-sm font-medium">15 dagar (6%)</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Annað:</span>
                          <div className="flex items-center">
                            <div className="w-48 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                              <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '2%' }}></div>
                            </div>
                            <span className="text-sm font-medium">5 dagar (2%)</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Frammistöðumat</h4>
                <div className="space-y-4">
                  {Object.entries(getPerformanceMetrics()).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {key === 'punctuality' ? '⏰ Stundvísi' :
                         key === 'teamwork' ? '👥 Samvinna' :
                         key === 'skills' ? '🎯 Fagkunnátta' :
                         key === 'patient_satisfaction' ? '😊 Ánægja sjúklinga' :
                         key === 'efficiency' ? '⚡ Skilvirkni' :
                         key === 'communication' ? '💬 Samskipti' : key}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-48 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${
                              value >= 95 ? 'bg-green-500' : 
                              value >= 90 ? 'bg-blue-500' : 
                              value >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-right">{value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg text-center">
                  <p className="text-3xl mb-2">🏆</p>
                  <p className="text-lg font-bold text-orange-700">Starfsmaður mánaðarins</p>
                  <p className="text-sm text-gray-600">Nóvember 2024</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg text-center">
                  <p className="text-3xl mb-2">📚</p>
                  <p className="text-lg font-bold text-indigo-700">12 námskeið</p>
                  <p className="text-sm text-gray-600">Lokið síðustu 12 mánuði</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg text-center">
                  <p className="text-3xl mb-2">💡</p>
                  <p className="text-lg font-bold text-emerald-700">8 hugmyndir</p>
                  <p className="text-sm text-gray-600">Til umbóta í starfi</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <h5 className="font-semibold text-gray-900 mb-3">Nýlegar viðurkenningar</h5>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="font-medium text-gray-900">Framúrskarandi þjónusta</p>
                      <p className="text-sm text-gray-600">Þakkarbréf frá sjúklingi fyrir góða umönnun</p>
                      <p className="text-xs text-gray-500">15. maí 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🤝</span>
                    <div>
                      <p className="font-medium text-gray-900">Frábær liðsmaður</p>
                      <p className="text-sm text-gray-600">Hjálpaði nýjum starfsmanni að aðlagast</p>
                      <p className="text-xs text-gray-500">8. maí 2025</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-medium text-gray-900">Náði markmiðum</p>
                      <p className="text-sm text-gray-600">100% mæting í mánuðinum</p>
                      <p className="text-xs text-gray-500">30. apríl 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white border rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Bæta við athugasemd</h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 h-32"
                  placeholder="Skrifaðu athugasemd hér..."
                />
                <button
                  onClick={saveNotes}
                  disabled={!notes.trim() || loading}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Vistar...' : 'Vista athugasemd'}
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Fyrri athugasemdir</h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900">Mjög duglegur starfsmaður, alltaf tilbúinn að hjálpa öðrum.</p>
                        <p className="text-xs text-gray-500 mt-1">Stjórnandi - 10. maí 2025</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900">Hefur sýnt mikinn áhuga á að læra nýja hluti og þróa sig í starfi.</p>
                        <p className="text-xs text-gray-500 mt-1">HR - 25. apríl 2025</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900">Fékk þakkarbréf frá fjölskyldu sjúklings fyrir góða umönnun.</p>
                        <p className="text-xs text-gray-500 mt-1">Deildarstjóri - 15. apríl 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Starfsferill</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-4">
                        <p className="font-medium text-gray-900">Framgangur í yfirhúkrunarfræðing</p>
                        <p className="text-sm text-gray-600">Fékk stöðuhækkun eftir framúrskarandi frammistöðu</p>
                        <p className="text-xs text-gray-500">1. janúar 2025</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-green-600 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-4">
                        <p className="font-medium text-gray-900">Lokið sérnámi í bráðahjúkrun</p>
                        <p className="text-sm text-gray-600">Lauk 18 mánaða sérnámi með hæstu einkunn</p>
                        <p className="text-xs text-gray-500">15. júní 2024</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-purple-600 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-4">
                        <p className="font-medium text-gray-900">Færði sig í bráðadeild</p>
                        <p className="text-sm text-gray-600">Óskaði eftir að færa sig úr almennri deild</p>
                        <p className="text-xs text-gray-500">1. september 2023</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 bg-gray-600 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <div className="bg-white border rounded-lg p-4">
                        <p className="font-medium text-gray-900">Hóf störf á spítalanum</p>
                        <p className="text-sm text-gray-600">Byrjaði sem hjúkrunarfræðingur á almennri deild</p>
                        <p className="text-xs text-gray-500">15. janúar 2020</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Námskeið og þjálfun</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-900 text-sm">Háþróuð endurlífgun</p>
                    <p className="text-xs text-blue-700">Mars 2025</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-900 text-sm">Sýkingavarnir</p>
                    <p className="text-xs text-green-700">Febrúar 2025</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-900 text-sm">Geðheilbrigðismál</p>
                    <p className="text-xs text-purple-700">Janúar 2025</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="font-medium text-orange-900 text-sm">Verkjastjórnun</p>
                    <p className="text-xs text-orange-700">Desember 2024</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between p-6 border-t bg-gray-50">
          <div className="flex space-x-2">
            {!staff.sick && (
              <button
                onClick={() => onReportSick(staff)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center"
              >
                <Icons.AlertTriangle className="w-4 h-4 mr-2" />
                Tilkynna veikindi
              </button>
            )}
            <button
              onClick={() => onEditStaff(staff)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center"
            >
              <Icons.Edit className="w-4 h-4 mr-2" />
              Breyta upplýsingum
            </button>
          </div>
          <button
            onClick={() => onDeleteStaff(staff)}
            className="px-4 py-2 text-red-600 hover:text-red-800 transition-all flex items-center"
          >
            <Icons.X className="w-4 h-4 mr-2" />
            Eyða starfsmanni
          </button>
        </div>
      </div>
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
};

// Weekly Schedule Component with Enhanced Grid
const WeeklySchedule = ({ staff, selectedWeek, shifts, onAddShift, onEditShift, onDeleteShift, onSubmitSchedule, onFindReplacement }) => {
  const [viewMode, setViewMode] = useState('week'); // week, day, month
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedShiftType, setSelectedShiftType] = useState('all');
  const [showConflicts, setShowConflicts] = useState(true);
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [hoveredCell, setHoveredCell] = useState(null);
  
  const shiftTypes = [
    { id: 'morning', label: 'Morgunvakt', time: '08:00-16:00', color: 'bg-yellow-200 text-yellow-900 border-yellow-300' },
    { id: 'evening', label: 'Kvöldvakt', time: '16:00-00:00', color: 'bg-blue-200 text-blue-900 border-blue-300' },
    { id: 'night', label: 'Næturvakt', time: '00:00-08:00', color: 'bg-purple-200 text-purple-900 border-purple-300' }
  ];

  const departments = ['Bráðadeild', 'Skurðdeild', 'Barnadeild', 'Hjartadeild'];
  
  const weekDays = ['Mánudagur', 'Þriðjudagur', 'Miðvikudagur', 'Fimmtudagur', 'Föstudagur', 'Laugardagur', 'Sunnudagur'];
  
  const getShiftsForDay = (day, staffMember) => {
    return shifts.filter(shift => 
      shift.day === day && 
      shift.staffId === staffMember.id &&
      (selectedDepartment === 'all' || shift.department === selectedDepartment) &&
      (selectedShiftType === 'all' || shift.type === selectedShiftType)
    );
  };

  const hasConflict = (staffMember, day) => {
    const dayShifts = getShiftsForDay(day, staffMember);
    return dayShifts.length > 1;
  };

  const getTotalHoursForStaff = (staffMember) => {
    const staffShifts = shifts.filter(s => s.staffId === staffMember.id);
    return staffShifts.reduce((total, shift) => {
      const type = shiftTypes.find(t => t.id === shift.type);
      return total + (type ? 8 : 0); // Assuming 8 hours per shift
    }, 0);
  };

  const handleCellClick = (staffMember, day) => {
    const existingShifts = getShiftsForDay(day, staffMember);
    if (existingShifts.length === 0) {
      onAddShift(staffMember, day);
    } else if (existingShifts.length === 1) {
      onEditShift(existingShifts[0]);
    }
  };

  const handleSubmitSchedule = async () => {
    await apiCall(API_CONFIG.SHIFT_MANAGEMENT_ENDPOINT, {
      action: 'submit_schedule',
      week: selectedWeek,
      shifts: shifts
    });
    onSubmitSchedule && onSubmitSchedule();
  };

  const isWeekendDay = (dayIndex) => dayIndex >= 5;

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold flex items-center">
            <Icons.Calendar className="w-8 h-8 mr-3" />
            Vaktaplan - Vika {selectedWeek}
          </h3>
          <div className="flex items-center space-x-3">
            <div className="flex bg-white bg-opacity-20 rounded-lg p-1">
              {['week', 'day', 'month'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === mode 
                      ? 'bg-white text-blue-600' 
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {mode === 'week' ? 'Vika' : mode === 'day' ? 'Dagur' : 'Mánuður'}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmitSchedule}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium flex items-center transform hover:scale-105"
            >
              <Icons.Check className="w-5 h-5 mr-2" />
              Staðfesta vaktaplan
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-3">
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 rounded-lg px-4 py-2 focus:bg-opacity-30 focus:outline-none"
          >
            <option value="all" className="text-gray-900">Allar deildir</option>
            {departments.map(dept => (
              <option key={dept} value={dept} className="text-gray-900">{dept}</option>
            ))}
          </select>

          <select
            value={selectedShiftType}
            onChange={(e) => setSelectedShiftType(e.target.value)}
            className="bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 rounded-lg px-4 py-2 focus:bg-opacity-30 focus:outline-none"
          >
            <option value="all" className="text-gray-900">Allar vaktir</option>
            {shiftTypes.map(type => (
              <option key={type.id} value={type.id} className="text-gray-900">{type.label}</option>
            ))}
          </select>

          <button
            onClick={() => setShowConflicts(!showConflicts)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              showConflicts 
                ? 'bg-red-500 text-white' 
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            {showConflicts ? '⚠️ Sýna árekstra' : '📋 Fela árekstra'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {shiftTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded ${type.color.split(' ')[0]} border-2 ${type.color.split(' ')[2] || ''}`}></div>
                <span className="text-sm font-medium text-gray-700">{type.label} ({type.time})</span>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Yfirmaður
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Veikur
            </span>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-20">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 sticky left-0 bg-gray-100 z-30 border-r border-gray-200">
                Starfsmaður
              </th>
              {weekDays.map((day, index) => (
                <th key={day} className={`px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-[140px] border-r border-gray-200 ${
                  isWeekendDay(index) ? 'bg-blue-50' : ''
                }`}>
                  <div>{day}</div>
                  <div className="text-xs text-gray-500 font-normal">
                    {new Date(2025, 4, 19 + index).toLocaleDateString('is-IS', { day: 'numeric', month: 'numeric' })}
                  </div>
                </th>
              ))}
              <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 sticky right-0 bg-gray-100 z-20 border-l border-gray-200">
                Samtals
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {staff.filter(s => !s.sick).map((staffMember, staffIndex) => (
              <tr key={staffMember.id} className={`${
                staffIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-blue-50 transition-colors`}>
                <td className="px-6 py-4 sticky left-0 bg-inherit z-10 border-r border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-12 rounded-full ${staffMember.lead ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{staffMember.name}</p>
                      <p className="text-xs text-gray-500">{staffMember.role} • {staffMember.department}</p>
                    </div>
                  </div>
                </td>
                {weekDays.map((day, dayIndex) => {
                  const dayShifts = getShiftsForDay(day, staffMember);
                  const isConflict = hasConflict(staffMember, day) && showConflicts;
                  const isWeekend = isWeekendDay(dayIndex);
                  const cellKey = `${staffMember.id}-${day}`;
                  
                  return (
                    <td 
                      key={day} 
                      className={`px-2 py-2 relative border-r border-gray-200 ${
                        isConflict ? 'bg-red-50' : isWeekend ? 'bg-blue-50' : ''
                      } ${hoveredCell === cellKey ? 'bg-blue-100' : ''}`}
                      onMouseEnter={() => setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                    >
                      <div className="space-y-1 min-h-[80px]">
                        {dayShifts.map((shift, index) => {
                          const shiftType = shiftTypes.find(t => t.id === shift.type);
                          return (
                            <div
                              key={shift.id || index}
                              className={`${shiftType.color} px-3 py-2 rounded-lg text-xs font-medium cursor-pointer hover:shadow-md transition-all border-2 relative group`}
                              onClick={() => onEditShift(shift)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">{shiftType.label}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteShift(shift);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Icons.X className="w-3 h-3 text-red-600 hover:text-red-800" />
                                </button>
                              </div>
                              {shift.department && shift.department !== staffMember.department && (
                                <p className="text-xs opacity-75 mt-1">📍 {shift.department}</p>
                              )}
                              {shift.priority === 'high' && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                          );
                        })}
                        {dayShifts.length === 0 && (
                          <button
                            onClick={() => handleCellClick(staffMember, day)}
                            className="w-full h-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                          >
                            <Icons.Plus className="w-5 h-5 mx-auto text-gray-400 group-hover:text-blue-500" />
                          </button>
                        )}
                      </div>
                      {isConflict && (
                        <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse shadow-md">
                          !
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-4 text-center sticky right-0 bg-inherit z-10 border-l border-gray-200">
                  <div className={`font-bold text-lg ${
                    getTotalHoursForStaff(staffMember) > 40 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {getTotalHoursForStaff(staffMember)} klst
                  </div>
                  {getTotalHoursForStaff(staffMember) > 40 && (
                    <p className="text-xs text-red-600 font-medium">⚠️ Yfirvinna!</p>
                  )}
                  {getTotalHoursForStaff(staffMember) === 0 && (
                    <p className="text-xs text-gray-500">Engar vaktir</p>
                  )}
                </td>
              </tr>
            ))}
            
            {/* Sick staff section */}
            {staff.filter(s => s.sick).length > 0 && (
              <>
                <tr>
                  <td colSpan={weekDays.length + 2} className="bg-red-50 px-6 py-2 text-sm font-semibold text-red-800">
                    Veikir starfsmenn
                  </td>
                </tr>
                {staff.filter(s => s.sick).map((staffMember, staffIndex) => (
                  <tr key={staffMember.id} className="bg-red-50 opacity-75">
                    <td className="px-6 py-4 sticky left-0 bg-red-50 z-10 border-r border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-12 rounded-full bg-red-500"></div>
                        <div>
                          <p className="font-medium text-gray-900 line-through">{staffMember.name}</p>
                          <p className="text-xs text-gray-500">{staffMember.role} • {staffMember.department}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => (
                      <td key={day} className="px-2 py-2 text-center border-r border-red-200">
                        <div className="text-red-600 text-sm">Veikur</div>
                      </td>
                    ))}
                    <td className="px-4 py-4 text-center sticky right-0 bg-red-50 z-10 border-l border-red-200">
                      <button
                        onClick={() => onFindReplacement && onFindReplacement(staffMember)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-all"
                      >
                        Finna staðgengil
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-100 p-6 border-t">
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Heildarfjöldi vakta</p>
            <p className="text-2xl font-bold text-gray-900">{shifts.length}</p>
            <p className="text-xs text-gray-500 mt-1">+12% frá síðustu viku</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Morgunvaktir</p>
            <p className="text-2xl font-bold text-yellow-600">
              {shifts.filter(s => s.type === 'morning').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{shiftTypes[0].time}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Kvöldvaktir</p>
            <p className="text-2xl font-bold text-blue-600">
              {shifts.filter(s => s.type === 'evening').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{shiftTypes[1].time}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Næturvaktir</p>
            <p className="text-2xl font-bold text-purple-600">
              {shifts.filter(s => s.type === 'night').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{shiftTypes[2].time}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Vaktaþekking</p>
            <div className="flex items-center mt-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(shifts.length / (staff.length * 7)) * 100}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm font-bold">
                {Math.round((shifts.length / (staff.length * 7)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-medium">
              <Icons.Copy className="w-4 h-4 inline mr-2" />
              Afrita síðustu viku
            </button>
            <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all font-medium">
              <Icons.Repeat className="w-4 h-4 inline mr-2" />
              Endurtaka mynstur
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Síðast uppfært: {new Date().toLocaleString('is-IS')}
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Chat Component
const AIChat = ({ onSuggestion }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      message: 'Halló! Ég er VaktAI, þinn persónulegi aðstoðarmaður í vaktastjórnun. Hvernig get ég aðstoðað þig í dag? 🤖',
      timestamp: new Date().toISOString(),
      suggestions: ['Sýna vaktayfirlit', 'Finna staðgengil', 'Bæta við starfsmanni']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setLoading(true);

    try {
      const response = await apiCall(API_CONFIG.AI_CHAT_ENDPOINT, {
        message: inputMessage,
        context: 'shift_management',
        language: 'is'
      });

      setTimeout(() => {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: response.data.response || 'Ég er að greina beiðni þína...',
          timestamp: new Date().toISOString(),
          suggestions: response.data.suggestions || []
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 1000);
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: 'Fyrirgefðu, ég gat ekki svarað þér að þessu sinni. Vinsamlegast reyndu aftur.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    if (onSuggestion) {
      onSuggestion(suggestion);
    }
  };

  const quickActions = [
    { label: '📊 Vaktayfirlit', action: 'Sýndu mér vaktayfirlit fyrir vikuna' },
    { label: '🔍 Finna staðgengil', action: 'Ég þarf að finna staðgengil fyrir veikan starfsmann' },
    { label: '⚡ Besta vaktaplanið', action: 'Búðu til besta vaktaplanið fyrir næstu viku' },
    { label: '📈 Tölfræði', action: 'Sýndu mér tölfræði um vaktir' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-2xl">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Icons.Brain className="w-6 h-6 mr-2" />
          VaktAI Aðstoðarmaður
        </h3>
        <p className="text-sm text-white opacity-90">Alltaf til staðar til að hjálpa þér</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div className={`max-w-[80%] ${
              msg.type === 'user' 
                ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl' 
                : 'bg-gray-100 text-gray-900 rounded-r-2xl rounded-tl-2xl'
            } p-4 shadow-md`}>
              {msg.type === 'ai' && (
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-semibold">VaktAI</span>
                </div>
              )}
              <p className="text-sm leading-relaxed">{msg.message}</p>
              {msg.type === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left px-3 py-2 bg-white bg-opacity-20 rounded-lg text-sm hover:bg-opacity-30 transition-all"
                    >
                      💡 {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <p className={`text-xs mt-2 ${
                msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(msg.timestamp).toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-gray-100 rounded-r-2xl rounded-tl-2xl p-4 shadow-md">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <div className="flex space-x-2 overflow-x-auto py-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => setInputMessage(action.action)}
              className="flex-shrink-0 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-all"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Spurðu mig hvað sem er..."
            className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center transform hover:scale-105"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <Icons.Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  // State Management
  const [staff, setStaff] = useState([
    { id: 1, name: 'Anna Sigurðardóttir', role: 'Hjúkrunarfræðingur', department: 'Bráðadeild', sick: false, lead: true },
    { id: 2, name: 'Björn Þórsson', role: 'Læknir', department: 'Skurðdeild', sick: false, lead: false },
    { id: 3, name: 'Elín Jónsdóttir', role: 'Hjúkrunarfræðingur', department: 'Barnadeild', sick: true, lead: false },
    { id: 4, name: 'Guðmundur Ólafsson', role: 'Sjúkraliði', department: 'Bráðadeild', sick: false, lead: false },
    { id: 5, name: 'Helga Kristjánsdóttir', role: 'Hjúkrunarfræðingur', department: 'Hjartadeild', sick: false, lead: true },
    { id: 6, name: 'Ívar Bergsson', role: 'Læknir', department: 'Bráðadeild', sick: false, lead: false },
    { id: 7, name: 'Jóhanna Guðmundsdóttir', role: 'Sjúkraliði', department: 'Barnadeild', sick: false, lead: false },
    { id: 8, name: 'Kristján Þorvaldsson', role: 'Hjúkrunarfræðingur', department: 'Skurðdeild', sick: false, lead: false },
    { id: 9, name: 'Lilja Sveinsdóttir', role: 'Læknir', department: 'Hjartadeild', sick: false, lead: true },
    { id: 10, name: 'Magnús Einarsson', role: 'Sjúkraliði', department: 'Bráðadeild', sick: false, lead: false },
    { id: 11, name: 'Nanna Pálsdóttir', role: 'Hjúkrunarfræðingur', department: 'Barnadeild', sick: false, lead: false },
    { id: 12, name: 'Ólafur Ragnarsson', role: 'Læknir', department: 'Skurðdeild', sick: false, lead: false }
  ]);

  const [tours, setTours] = useState([
    { id: 1, name: 'Gullni hringurinn', type: 'day', time: '09:00-17:00', requiresLicence: 'D', requiredStaff: 2 },
    { id: 2, name: 'Norðurljósaferð', type: 'evening', time: '20:00-01:00', requiresLicence: '', requiredStaff: 1 },
    { id: 3, name: 'Jöklaganga', type: 'day', time: '08:00-18:00', requiresLicence: 'Glacier', requiredStaff: 3 }
  ]);

  const [shifts, setShifts] = useState([
    { id: 1, staffId: 1, day: 'Mánudagur', type: 'morning', department: 'Bráðadeild' },
    { id: 2, staffId: 1, day: 'Þriðjudagur', type: 'evening', department: 'Bráðadeild' },
    { id: 3, staffId: 2, day: 'Mánudagur', type: 'morning', department: 'Skurðdeild' },
    { id: 4, staffId: 4, day: 'Miðvikudagur', type: 'night', department: 'Bráðadeild' },
    { id: 5, staffId: 5, day: 'Fimmtudagur', type: 'morning', department: 'Hjartadeild' },
    { id: 6, staffId: 6, day: 'Föstudagur', type: 'evening', department: 'Bráðadeild' }
  ]);

  const [selectedWeek, setSelectedWeek] = useState(21);
  const [currentView, setCurrentView] = useState('schedule');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState([]);
  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    message: '',
    progress: 0
  });

  // Modal States
  const [modals, setModals] = useState({
    settings: false,
    notifications: false,
    addStaff: false,
    addTour: false,
    staffDetails: null,
    editShift: null,
    sickCall: null,
    replacement: null,
    addShift: null
  });

  const [analytics, setAnalytics] = useState({
    efficiency: 0,
    satisfaction: 0,
    coverage: 0,
    costs: 0
  });

  const [weather, setWeather] = useState(null);

  // Initialize component and fetch weather
  useEffect(() => {
    // Log component initialization
    console.log('🚀 VaktAI v3.0 initialized', {
      staff: staff.length,
      shifts: shifts.length,
      tours: tours.length,
      apiEndpoints: Object.keys(API_CONFIG).length
    });
    
    // Fetch weather
    const fetchWeather = async () => {
      try {
        const response = await apiCall(API_CONFIG.WEATHER_ENDPOINT);
        setWeather(response.data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // Update every 5 minutes
    
    // Check API connectivity
    const checkAPIConnectivity = async () => {
      try {
        const analyticsResponse = await apiCall(API_CONFIG.ANALYTICS_ENDPOINT);
        if (analyticsResponse.success) {
          console.log('✅ API connectivity confirmed');
        }
      } catch (error) {
        console.error('⚠️ API connectivity check failed:', error);
      }
    };
    
    checkAPIConnectivity();
    
    return () => clearInterval(interval);
  }, []);

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiCall(API_CONFIG.ANALYTICS_ENDPOINT);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
  }, [shifts, staff]);

  // Toast management
  const showToast = (message, type = 'info', actions = []) => {
    const toast = {
      id: Date.now(),
      message,
      type,
      actions
    };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Staff management functions
  const handleAddStaff = (newStaff) => {
    setStaff(prev => [...prev, newStaff]);
    showToast(`${newStaff.fullName} hefur verið bætt við!`, 'success');
  };

  const handleReportSick = async (staffMember) => {
    setLoadingState({
      isLoading: true,
      message: 'Tilkynnir veikindi...',
      progress: 50
    });

    try {
      await apiCall(API_CONFIG.SICK_CALL_ENDPOINT, {
        staffId: staffMember.id,
        date: new Date().toISOString()
      });

      setStaff(prev => prev.map(s => 
        s.id === staffMember.id ? { ...s, sick: true } : s
      ));

      // Open replacement modal
      setModals(prev => ({ ...prev, replacement: staffMember }));

      showToast(
        `Veikindi ${staffMember.name} hafa verið skráð`,
        'warning',
        [
          { label: 'Finna staðgengil', onClick: () => setModals(prev => ({ ...prev, replacement: staffMember })) },
          { label: 'Hætta við', onClick: () => cancelSickReport(staffMember) }
        ]
      );
    } catch (error) {
      showToast('Villa við að tilkynna veikindi', 'error');
    } finally {
      setLoadingState({ isLoading: false, message: '', progress: 0 });
    }
  };

  const findReplacement = (sickStaff) => {
    const availableStaff = staff.filter(s => 
      !s.sick && 
      s.department === sickStaff.department && 
      s.id !== sickStaff.id
    );

    if (availableStaff.length > 0) {
      showToast(
        `${availableStaff.length} starfsmenn geta tekið við vöktum`,
        'info'
      );
    } else {
      showToast('Enginn starfsmaður tiltækur í þessari deild', 'warning');
    }
  };

  const cancelSickReport = (staffMember) => {
    setStaff(prev => prev.map(s => 
      s.id === staffMember.id ? { ...s, sick: false } : s
    ));
    showToast('Veikindatilkynning afturkölluð', 'info');
  };

  // Tour management
  const handleAddTour = (newTour) => {
    setTours(prev => [...prev, newTour]);
    showToast(`Ferð "${newTour.name}" hefur verið bætt við!`, 'success');
  };

  const handleEditTour = (tourId) => {
    const tour = tours.find(t => t.id === tourId);
    if (tour) {
      // For now, show a toast. In production, you'd open an edit modal
      showToast(`Breytir ferð: ${tour.name}`, 'info');
      console.log('Edit tour:', tour);
    }
  };

  const handleAssignTour = (tourId) => {
    const tour = tours.find(t => t.id === tourId);
    if (tour) {
      // For now, show a toast. In production, you'd open an assignment modal
      showToast(`Úthlutar starfsmönnum í ferð: ${tour.name}`, 'info');
      console.log('Assign staff to tour:', tour);
    }
  };

  // Shift management
  const handleAddShift = (shiftData) => {
    setShifts(prev => [...prev, shiftData]);
    showToast('Vakt hefur verið bætt við', 'success');
  };

  const handleEditShift = (shiftData) => {
    setShifts(prev => prev.map(s => s.id === shiftData.id ? shiftData : s));
    showToast('Vakt hefur verið uppfærð', 'success');
  };

  const handleDeleteShift = (shift) => {
    setShifts(prev => prev.filter(s => s.id !== shift.id));
    showToast('Vakt hefur verið eytt', 'info');
  };

  const handleSubmitSchedule = () => {
    showToast('Vaktaplan hefur verið staðfest og sent á starfsfólk', 'success');
  };

  // AI Schedule Optimization
  const handleAIOptimize = async () => {
    setLoadingState({
      isLoading: true,
      message: 'AI er að búa til bestu vaktaáætlun...',
      progress: 0
    });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90)
      }));
    }, 300);

    try {
      const response = await apiCall(API_CONFIG.AI_SCHEDULE_ENDPOINT, {
        staff: staff.filter(s => !s.sick),
        currentShifts: shifts,
        week: selectedWeek
      });

      clearInterval(progressInterval);
      setLoadingState(prev => ({ ...prev, progress: 100 }));

      setTimeout(() => {
        showToast(
          `AI hefur bætt vaktaplanið! ${response.data.schedule.efficiency_gain}% skilvirkari`,
          'success',
          [
            { label: 'Samþykkja breytingar', onClick: () => applyAIChanges(response.data) },
            { label: 'Skoða tillögur', onClick: () => viewAISuggestions(response.data) }
          ]
        );
        setLoadingState({ isLoading: false, message: '', progress: 0 });
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      showToast('Villa við að búa til AI vaktaplan', 'error');
      setLoadingState({ isLoading: false, message: '', progress: 0 });
    }
  };

  const applyAIChanges = (aiData) => {
    // Apply AI suggested changes
    if (aiData.schedule.suggestions) {
      aiData.schedule.suggestions.forEach(suggestion => {
        setShifts(prev => prev.map(shift => 
          shift.staffId === suggestion.staffId && shift.day === suggestion.day
            ? { ...shift, type: suggestion.to }
            : shift
        ));
      });
    }
    showToast('AI breytingar hafa verið framkvæmdar', 'success');
  };

  const viewAISuggestions = (aiData) => {
    // Show AI suggestions in a detailed view
    const suggestions = aiData.schedule.suggestions || [];
    let message = '🤖 AI Tillögur til að bæta vaktaplanið:\n\n';
    
    suggestions.forEach((s, index) => {
      const staffMember = staff.find(st => st.id === s.staffId);
      message += `${index + 1}. Færa ${staffMember?.name || 'starfsmann'} úr ${s.from} í ${s.to} á ${s.day}\n`;
    });
    
    message += `\n✨ Þetta mun auka skilvirkni um ${aiData.schedule.efficiency_gain}%`;
    message += `\n🔧 ${aiData.schedule.conflicts_resolved} árekstrar leystir`;
    message += `\n📊 ${aiData.schedule.changes} breytingar gerðar`;
    
    // Create a more detailed modal-like toast
    showToast(message, 'info', [
      { label: '✅ Samþykkja allar', onClick: () => applyAIChanges(aiData) },
      { label: '❌ Hafna', onClick: () => showToast('AI tillögum hafnað', 'info') }
    ]);
  };

  // Export functionality
  const handleExport = async (format) => {
    setLoadingState({
      isLoading: true,
      message: `Útflytjir í ${format.toUpperCase()} sniði...`,
      progress: 50
    });

    try {
      await apiCall(API_CONFIG.EXPORT_ENDPOINT, {
        format,
        data: { staff, shifts, week: selectedWeek }
      });

      setTimeout(() => {
        showToast(`Vaktaplan hefur verið flutt út sem ${format.toUpperCase()}`, 'success');
        setLoadingState({ isLoading: false, message: '', progress: 0 });
      }, 1000);
    } catch (error) {
      showToast('Villa við útflutning', 'error');
      setLoadingState({ isLoading: false, message: '', progress: 0 });
    }
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  // Navigation
  const handleNextWeek = () => {
    setSelectedWeek(prev => prev + 1);
    showToast(`Færði í viku ${selectedWeek + 1}`, 'info');
  };

  const handlePreviousWeek = () => {
    setSelectedWeek(prev => Math.max(prev - 1, 1));
    showToast(`Færði í viku ${Math.max(selectedWeek - 1, 1)}`, 'info');
  };

  // Filtered staff based on search
  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculations
  const stats = {
    totalStaff: staff.length,
    activeStaff: staff.filter(s => !s.sick).length,
    sickStaff: staff.filter(s => s.sick).length,
    totalShifts: shifts.length
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-2xl no-print">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                  <Icons.Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold flex items-center">
                    VaktAI
                    <span className="ml-2 text-sm bg-white bg-opacity-20 px-2 py-1 rounded-full">v3.0</span>
                  </h1>
                  <p className="text-sm opacity-90">Snjall vaktastjórnun með AI</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Weather Widget */}
                {weather && (
                  <div className="bg-white bg-opacity-20 rounded-xl px-4 py-2 backdrop-blur-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{weather.icon}</span>
                      <div>
                        <p className="text-lg font-semibold">{weather.temperature}°C</p>
                        <p className="text-xs opacity-90">{weather.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <button
                  onClick={() => setModals(prev => ({ ...prev, notifications: true }))}
                  className="relative p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all"
                >
                  <Icons.Bell className="w-6 h-6" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <button
                  onClick={() => setModals(prev => ({ ...prev, settings: true }))}
                  className="p-3 bg-white bg-opacity-20 rounded-xl hover:bg-opacity-30 transition-all"
                >
                  <Icons.Settings className="w-6 h-6" />
                </button>

                <div className="flex items-center space-x-3 ml-6">
                  <div className="text-right">
                    <p className="font-semibold">Jón Jónsson</p>
                    <p className="text-xs opacity-90">Yfirmaður vakta</p>
                  </div>
                  <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center font-bold text-lg">
                    JJ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-md sticky top-0 z-40 no-print">
          <div className="container mx-auto px-4">
            <div className="flex space-x-1">
              {[
                { id: 'schedule', label: 'Vaktaplan', icon: Icons.Calendar },
                { id: 'staff', label: 'Starfsfólk', icon: Icons.Users },
                { id: 'tours', label: 'Ferðir', icon: Icons.MapPin },
                { id: 'analytics', label: 'Tölfræði', icon: Icons.TrendingUp },
                { id: 'ai', label: 'AI Aðstoð', icon: Icons.Brain }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all border-b-4 ${
                    currentView === tab.id
                      ? 'text-blue-600 border-blue-600 bg-blue-50'
                      : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 no-print">
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Starfsfólk alls</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStaff}</p>
                  <p className="text-xs text-green-600 mt-1">+2 frá síðustu viku</p>
                </div>
                <div className="p-4 bg-blue-100 rounded-full">
                  <Icons.Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Virkir í dag</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeStaff}</p>
                  <p className="text-xs text-gray-600 mt-1">{((stats.activeStaff / stats.totalStaff) * 100).toFixed(0)}% mætt</p>
                </div>
                <div className="p-4 bg-green-100 rounded-full">
                  <Icons.Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Veikindi</p>
                  <p className="text-3xl font-bold text-red-600">{stats.sickStaff}</p>
                  <p className="text-xs text-orange-600 mt-1">⚠️ Þarf staðgengla</p>
                </div>
                <div className="p-4 bg-red-100 rounded-full">
                  <Icons.AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Skilvirkni</p>
                  <p className="text-3xl font-bold text-purple-600">{analytics.efficiency}%</p>
                  <p className="text-xs text-purple-600 mt-1">↑ {analytics.efficiency - 90}% bæting</p>
                </div>
                <div className="p-4 bg-purple-100 rounded-full">
                  <Icons.Zap className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Based on Current View */}
          {currentView === 'schedule' && (
            <div className="space-y-6">
              {/* Week Selector and Actions */}
              <div className="flex items-center justify-between mb-6 no-print">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePreviousWeek}
                    className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <Icons.ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Vika {selectedWeek} - {new Date(2025, 4, 19).toLocaleDateString('is-IS')}
                  </h2>
                  <button
                    onClick={handleNextWeek}
                    className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <Icons.ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAIOptimize}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium flex items-center transform hover:scale-105 shadow-lg"
                  >
                    <Icons.Sparkles className="w-5 h-5 mr-2" />
                    AI Bestun
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => document.getElementById('exportMenu').classList.toggle('hidden')}
                      className="px-4 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium flex items-center shadow-md"
                    >
                      <Icons.Download className="w-5 h-5 mr-2" />
                      Flytja út
                      <Icons.ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                    <div id="exportMenu" className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                      <button
                        onClick={() => handleExport('pdf')}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-all"
                      >
                        📄 PDF skjal
                      </button>
                      <button
                        onClick={() => handleExport('excel')}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-all"
                      >
                        📊 Excel skjal
                      </button>
                      <button
                        onClick={handlePrint}
                        className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-all"
                      >
                        🖨️ Prenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Schedule Component */}
              <WeeklySchedule
                staff={filteredStaff}
                selectedWeek={selectedWeek}
                shifts={shifts}
                onAddShift={(staff, day) => {
                  setModals(prev => ({ 
                    ...prev, 
                    addShift: { staff, day }
                  }));
                }}
                onEditShift={(shift) => {
                  setModals(prev => ({ ...prev, editShift: shift }));
                }}
                onDeleteShift={handleDeleteShift}
                onSubmitSchedule={handleSubmitSchedule}
                onFindReplacement={(sickStaff) => {
                  setModals(prev => ({ ...prev, replacement: sickStaff }));
                }}
              />
            </div>
          )}

          {currentView === 'staff' && (
            <div className="space-y-6">
              {/* Staff Management Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Starfsmannastjórnun</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Icons.Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Leita að starfsmanni..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>
                  <button
                    onClick={() => setModals(prev => ({ ...prev, addStaff: true }))}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all font-medium flex items-center transform hover:scale-105 shadow-lg"
                  >
                    <Icons.Plus className="w-5 h-5 mr-2" />
                    Bæta við starfsmanni
                  </button>
                </div>
              </div>

              {/* Staff Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map(staffMember => (
                  <div key={staffMember.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            staffMember.sick ? 'bg-red-500' : 'bg-gradient-to-br from-blue-500 to-purple-500'
                          }`}>
                            {staffMember.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 flex items-center">
                              {staffMember.name}
                              {staffMember.lead && <span className="ml-2 text-yellow-500">👑</span>}
                              {staffMember.sick && <span className="ml-2 text-red-500">🤒</span>}
                            </h3>
                            <p className="text-sm text-gray-600">{staffMember.role}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setModals(prev => ({ ...prev, staffDetails: staffMember }))}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Icons.ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Deild:</span>
                          <span className="font-medium">{staffMember.department}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Staða:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            staffMember.sick 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {staffMember.sick ? 'Veikur' : 'Virkur'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Vaktir í viku:</span>
                          <span className="font-medium">{shifts.filter(s => s.staffId === staffMember.id).length}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => setModals(prev => ({ ...prev, staffDetails: staffMember }))}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                        >
                          Skoða
                        </button>
                        {!staffMember.sick && (
                          <button
                            onClick={() => handleReportSick(staffMember)}
                            className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-medium"
                          >
                            Veikindi
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'tours' && (
            <div className="space-y-6">
              {/* Tours Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ferðastjórnun</h2>
                <button
                  onClick={() => setModals(prev => ({ ...prev, addTour: true }))}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all font-medium flex items-center transform hover:scale-105 shadow-lg"
                >
                  <Icons.Plus className="w-5 h-5 mr-2" />
                  Bæta við ferð
                </button>
              </div>

              {/* Tours Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map(tour => (
                  <div key={tour.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{tour.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tour.type === 'day' ? 'bg-yellow-100 text-yellow-700' :
                          tour.type === 'evening' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {tour.type === 'day' ? '🌞 Dagferð' :
                           tour.type === 'evening' ? '🌆 Kvöldferð' :
                           '🎯 Einkaferð'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Icons.Clock className="w-4 h-4 mr-2" />
                          {tour.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Icons.Users className="w-4 h-4 mr-2" />
                          {tour.requiredStaff} starfsmenn
                        </div>
                        {tour.requiresLicence && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Icons.Award className="w-4 h-4 mr-2" />
                            Krefst: {tour.requiresLicence}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleAssignTour(tour.id)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-medium"
                        >
                          Úthluta
                        </button>
                        <button 
                          onClick={() => handleEditTour(tour.id)}
                          className="flex-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all text-sm font-medium"
                        >
                          Breyta
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tölfræði og greiningar</h2>
              
              {/* Analytics Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChart
                  data={{
                    labels: ['Mán', 'Þri', 'Mið', 'Fim', 'Fös', 'Lau', 'Sun'],
                    datasets: [{
                      data: [28, 32, 30, 35, 31, 25, 22]
                    }]
                  }}
                  title="Vaktir eftir dögum"
                  className="bg-white rounded-xl shadow-lg p-6 h-80"
                />

                <LineChart
                  data={{
                    labels: ['Vika 18', 'Vika 19', 'Vika 20', 'Vika 21'],
                    datasets: [{
                      data: [88, 92, 94, analytics.efficiency]
                    }]
                  }}
                  title="Skilvirkni yfir tíma"
                  className="bg-white rounded-xl shadow-lg p-6 h-80"
                />

                <DoughnutChart
                  data={{
                    labels: ['Bráðadeild', 'Skurðdeild', 'Barnadeild', 'Hjartadeild'],
                    datasets: [{
                      data: [35, 25, 20, 20]
                    }]
                  }}
                  title="Vaktir eftir deildum"
                  className="bg-white rounded-xl shadow-lg p-6 h-80"
                />

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Helstu tölur</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Meðal vinnustundir</p>
                        <p className="text-2xl font-bold text-gray-900">38.5 klst/viku</p>
                      </div>
                      <Icons.Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Ánægja starfsfólks</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.satisfaction}%</p>
                      </div>
                      <Icons.Heart className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Kostnaður</p>
                        <p className="text-2xl font-bold text-gray-900">{analytics.costs}%</p>
                      </div>
                      <Icons.TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'ai' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AIChat
                  onSuggestion={(suggestion) => {
                    console.log('AI Suggestion:', suggestion);
                  }}
                />
              </div>

              <div className="space-y-6">
                {/* AI Insights */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Icons.Brain className="w-6 h-6 mr-2 text-purple-600" />
                    AI Innsýn
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">💡 Ábending</p>
                      <p className="text-xs text-blue-700 mt-1">
                        3 starfsmenn eru með yfir 45 klst í viku. Mæli með að dreifa vöktum betur.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-900">✅ Vel gert</p>
                      <p className="text-xs text-green-700 mt-1">
                        Vaktaskipulag er 96% skilvirkt sem er yfir meðaltali.
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">⚠️ Viðvörun</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Vantar starfsfólk á kvöldvakt á fimmtudag.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick AI Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Flýtiaðgerðir</h3>
                  <div className="space-y-2">
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-lg hover:from-purple-100 hover:to-blue-100 transition-all text-sm font-medium text-left">
                      🔮 Spá fyrir næstu viku
                    </button>
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all text-sm font-medium text-left">
                      🎯 Finna besta starfsmann
                    </button>
                    <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-lg hover:from-orange-100 hover:to-red-100 transition-all text-sm font-medium text-left">
                      📊 Greina vaktamynstur
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Modals */}
        <SettingsModal
          isOpen={modals.settings}
          onClose={() => setModals(prev => ({ ...prev, settings: false }))}
          onSave={(settings) => {
            console.log('Settings saved:', settings);
            showToast('Stillingar vistaðar', 'success');
          }}
        />

        <NotificationsModal
          isOpen={modals.notifications}
          onClose={() => setModals(prev => ({ ...prev, notifications: false }))}
        />

        <AddStaffModal
          isOpen={modals.addStaff}
          onClose={() => setModals(prev => ({ ...prev, addStaff: false }))}
          onAddStaff={handleAddStaff}
        />

        <AddTourModal
          isOpen={modals.addTour}
          onClose={() => setModals(prev => ({ ...prev, addTour: false }))}
          onAddTour={handleAddTour}
        />

        {modals.staffDetails && (
          <StaffDetailsModal
            isOpen={true}
            onClose={() => setModals(prev => ({ ...prev, staffDetails: null }))}
            staff={modals.staffDetails}
            onReportSick={handleReportSick}
            onEditStaff={(staff) => {
              console.log('Edit staff:', staff);
              showToast('Upplýsingar uppfærðar', 'success');
            }}
            onDeleteStaff={(staff) => {
              setStaff(prev => prev.filter(s => s.id !== staff.id));
              setModals(prev => ({ ...prev, staffDetails: null }));
              showToast(`${staff.name} hefur verið fjarlægður`, 'info');
            }}
          />
        )}

        {modals.editShift && (
          <ShiftModal
            isOpen={true}
            onClose={() => setModals(prev => ({ ...prev, editShift: null }))}
            onSave={handleEditShift}
            shift={modals.editShift}
            staff={staff}
          />
        )}

        {modals.addShift && (
          <ShiftModal
            isOpen={true}
            onClose={() => setModals(prev => ({ ...prev, addShift: null }))}
            onSave={handleAddShift}
            staff={staff}
            day={modals.addShift.day}
            staffMember={modals.addShift.staff}
          />
        )}

        {modals.replacement && (
          <ReplacementModal
            isOpen={true}
            onClose={() => setModals(prev => ({ ...prev, replacement: null }))}
            sickStaff={modals.replacement}
            shifts={shifts}
            staff={staff}
            onSelectReplacement={(replacement) => {
              showToast(`${replacement.name} hefur verið valinn sem staðgengill`, 'success');
              setModals(prev => ({ ...prev, replacement: null }));
            }}
          />
        )}

        {/* Loading Overlay */}
        <LoadingSpinner
          isVisible={loadingState.isLoading}
          message={loadingState.message}
          progress={loadingState.progress}
        />

        {/* Toast Container */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              actions={toast.actions}
            />
          ))}
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 mt-16 no-print">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-3">VaktAI</h3>
                <p className="text-sm text-gray-400">
                  Þróað með ❤️ af íslenskum hugbúnaðarsérfræðingum
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Flýtileiðir</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Hjálp</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Leiðbeiningar</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API skjölun</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Stuðningur</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center">
                    <Icons.Phone className="w-4 h-4 mr-2" />
                    +354 555 0000
                  </li>
                  <li className="flex items-center">
                    <Icons.Mail className="w-4 h-4 mr-2" />
                    support@vaktai.is
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Lagalegur fyrirvari</h4>
                <p className="text-sm text-gray-400">
                  © 2025 VaktAI. Öll réttindi áskilin. 
                  Persónuverndarstefna og skilmálar gilda.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.5s ease-out;
        }
        
        .animate-slideOutDown {
          animation: slideOutDown 0.5s ease-out;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        /* Tailwind color fixes for dynamic classes */
        .from-blue-50 { --tw-gradient-from: #eff6ff; }
        .from-green-50 { --tw-gradient-from: #f0fdf4; }
        .from-red-50 { --tw-gradient-from: #fef2f2; }
        .from-yellow-50 { --tw-gradient-from: #fefce8; }
        .from-purple-50 { --tw-gradient-from: #faf5ff; }
        .from-orange-50 { --tw-gradient-from: #fff7ed; }
        .from-cyan-50 { --tw-gradient-from: #ecfeff; }
        .from-pink-50 { --tw-gradient-from: #fdf2f8; }
        .from-emerald-50 { --tw-gradient-from: #ecfdf5; }
        .from-indigo-50 { --tw-gradient-from: #eef2ff; }
        
        .to-blue-100 { --tw-gradient-to: #dbeafe; }
        .to-green-100 { --tw-gradient-to: #dcfce7; }
        .to-red-100 { --tw-gradient-to: #fee2e2; }
        .to-yellow-100 { --tw-gradient-to: #fef3c7; }
        .to-purple-100 { --tw-gradient-to: #f3e8ff; }
        .to-orange-100 { --tw-gradient-to: #fed7aa; }
        .to-cyan-100 { --tw-gradient-to: #cffafe; }
        .to-pink-100 { --tw-gradient-to: #fce7f3; }
        .to-emerald-100 { --tw-gradient-to: #d1fae5; }
        .to-indigo-100 { --tw-gradient-to: #e0e7ff; }
        
        .text-blue-700 { color: #1d4ed8; }
        .text-green-700 { color: #15803d; }
        .text-red-700 { color: #b91c1c; }
        .text-yellow-700 { color: #a16207; }
        .text-purple-700 { color: #6b21a8; }
        .text-orange-700 { color: #c2410c; }
        .text-cyan-700 { color: #0e7490; }
        .text-pink-700 { color: #be185d; }
        .text-emerald-700 { color: #047857; }
        .text-indigo-700 { color: #4338ca; }
        
        .bg-yellow-200 { background-color: #fef08a; }
        .bg-blue-200 { background-color: #bfdbfe; }
        .bg-purple-200 { background-color: #e9d5ff; }
        
        .text-yellow-900 { color: #713f12; }
        .text-blue-900 { color: #1e3a8a; }
        .text-purple-900 { color: #581c87; }
        
        .border-yellow-300 { border-color: #fde047; }
        .border-blue-300 { border-color: #93c5fd; }
        .border-purple-300 { border-color: #d8b4fe; }
      `}</style>
    </ErrorBoundary>
  );
};

export default App;