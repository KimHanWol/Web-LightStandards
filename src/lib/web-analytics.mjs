import configuration from '../../config/web-analytics.json' with {type:'json'};

if(configuration.enabled&&!/^[a-f0-9]{32}$/i.test(configuration.token)){
  throw new Error('An enabled Cloudflare Web Analytics site needs its public beacon token.');
}

export const webAnalytics=configuration;
