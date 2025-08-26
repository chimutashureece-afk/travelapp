import platform
import sys
import psutil
import subprocess
from pathlib import Path

def get_system_info():
    """Get comprehensive system information"""
    
    info = {
        'system': {
            'platform': platform.platform(),
            'system': platform.system(),
            'release': platform.release(),
            'version': platform.version(),
            'machine': platform.machine(),
            'processor': platform.processor(),
        },
        'python': {
            'version': sys.version,
            'executable': sys.executable,
            'prefix': sys.prefix,
        },
        'memory': {
            'total': psutil.virtual_memory().total,
            'available': psutil.virtual_memory().available,
            'used': psutil.virtual_memory().used,
            'percent': psutil.virtual_memory().percent,
        },
        'cpu': {
            'count': psutil.cpu_count(),
            'percent': psutil.cpu_percent(interval=1),
        },
        'disk': {
            'total': psutil.disk_usage('/').total,
            'used': psutil.disk_usage('/').used,
            'free': psutil.disk_usage('/').free,
        }
    }
    
    # Check for CUDA availability
    try:
        import torch
        info['torch'] = {
            'version': torch.__version__,
            'cuda_available': torch.cuda.is_available(),
            'cuda_version': torch.version.cuda if torch.cuda.is_available() else None,
            'device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0,
        }
        
        if torch.cuda.is_available():
            info['gpu'] = []
            for i in range(torch.cuda.device_count()):
                gpu_info = {
                    'id': i,
                    'name': torch.cuda.get_device_name(i),
                    'memory_total': torch.cuda.get_device_properties(i).total_memory,
                    'memory_reserved': torch.cuda.memory_reserved(i),
                    'memory_allocated': torch.cuda.memory_allocated(i),
                }
                info['gpu'].append(gpu_info)
                
    except ImportError:
        info['torch'] = {
            'installed': False,
            'error': 'PyTorch not installed'
        }
    
    # Check for other ML libraries
    try:
        import diffusers
        info['diffusers'] = {
            'version': diffusers.__version__
        }
    except ImportError:
        info['diffusers'] = {'installed': False}
    
    try:
        import transformers
        info['transformers'] = {
            'version': transformers.__version__
        }
    except ImportError:
        info['transformers'] = {'installed': False}
    
    return info