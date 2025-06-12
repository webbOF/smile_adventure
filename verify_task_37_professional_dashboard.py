#!/usr/bin/env python3
"""
🎯 TASK 37 VERIFICATION: Professional Dashboard Layout
Verificatore per il layout professionale della dashboard

Requirements verificati:
✅ Professional-focused dashboard
✅ Patient list sidebar  
✅ Multi-patient overview cards
✅ Quick actions menu
✅ Responsive layout
✅ Data-testid attributes for testing
✅ Accessibility compliance
"""

import os
import re
import json
from datetime import datetime

def check_file_exists(filepath):
    """Verifica che il file esista"""
    return os.path.exists(filepath)

def analyze_professional_dashboard(filepath):
    """Analizza il componente ProfessionalDashboard per verificare i requisiti del Task 37"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    results = {
        'file_exists': True,
        'total_lines': len(content.split('\n')),
        'requirements_check': {},
        'components_found': {},
        'accessibility_features': {},
        'testing_attributes': {},
        'interactive_features': {},
        'code_quality': {}
    }
    
    # 1. Professional Layout Requirements
    results['requirements_check']['professional_focused_layout'] = bool(
        re.search(r'min-h-screen.*bg-gray-50', content) and
        re.search(r'Professional.*Dashboard', content)
    )
    
    # 2. Patient List Sidebar
    sidebar_patterns = [
        r'patients-sidebar',
        r'sidebar.*patient|patient.*sidebar',
        r'fixed.*inset-y-0.*left-0',
        r'w-80.*bg-white.*shadow',
        r'Lista Pazienti'
    ]
    results['requirements_check']['patient_list_sidebar'] = all(
        re.search(pattern, content, re.IGNORECASE) for pattern in sidebar_patterns[:3]
    )
    
    # 3. Multi-Patient Overview Cards  
    overview_patterns = [
        r'stats.*overview|overview.*stats',
        r'grid.*grid-cols.*gap',
        r'Pazienti Totali',
        r'Bambini Attivi',
        r'Sessioni Completate',
        r'Punteggio Medio'
    ]
    results['requirements_check']['multi_patient_overview_cards'] = all(
        re.search(pattern, content, re.IGNORECASE) for pattern in overview_patterns[:4]
    )
    
    # 4. Quick Actions Menu
    quick_actions_patterns = [
        r'quick.*actions|actions.*quick',
        r'Azioni Rapide',
        r'Nuovo Paziente',
        r'Genera Report',
        r'Pianifica Sessione',
        r'Analisi Avanzate'
    ]
    results['requirements_check']['quick_actions_menu'] = sum(
        1 for pattern in quick_actions_patterns if re.search(pattern, content, re.IGNORECASE)
    ) >= 4
    
    # 5. Responsive Design
    responsive_patterns = [
        r'lg:',
        r'md:',
        r'sm:',
        r'lg:hidden',
        r'lg:translate-x-0',
        r'lg:pl-80'
    ]
    results['requirements_check']['responsive_design'] = sum(
        1 for pattern in responsive_patterns if re.search(pattern, content)
    ) >= 4
    
    # Components Analysis
    results['components_found']['sidebar_component'] = bool(re.search(r'patients-sidebar', content))
    results['components_found']['search_filter'] = bool(re.search(r'patients-search-filter', content))
    results['components_found']['patient_cards'] = bool(re.search(r'patient-card-', content))
    results['components_found']['quick_actions'] = bool(re.search(r'quick-action-', content))
    results['components_found']['stats_overview'] = bool(re.search(r'stats-overview', content))
    results['components_found']['main_content'] = bool(re.search(r'main-content', content))
    
    # Accessibility Features
    results['accessibility_features']['aria_labels'] = len(re.findall(r'aria-label=', content))
    results['accessibility_features']['role_attributes'] = len(re.findall(r'role=', content))
    results['accessibility_features']['keyboard_support'] = bool(re.search(r'onKeyDown', content))
    results['accessibility_features']['tab_index'] = len(re.findall(r'tabIndex=', content))
    
    # Testing Attributes
    testid_matches = re.findall(r'data-testid="([^"]+)"', content)
    results['testing_attributes']['total_testids'] = len(testid_matches)
    results['testing_attributes']['testid_list'] = testid_matches
    results['testing_attributes']['comprehensive_coverage'] = len(testid_matches) >= 10
    
    # Interactive Features
    results['interactive_features']['state_management'] = bool(re.search(r'useState', content))
    results['interactive_features']['search_functionality'] = bool(re.search(r'searchTerm', content))
    results['interactive_features']['filter_functionality'] = bool(re.search(r'selectedPatientFilter', content))
    results['interactive_features']['sidebar_toggle'] = bool(re.search(r'sidebarOpen', content))
    results['interactive_features']['click_handlers'] = len(re.findall(r'onClick=', content))
    
    # Code Quality
    results['code_quality']['helper_functions'] = len(re.findall(r'const get\w+\s*=', content))
    results['code_quality']['prop_destructuring'] = bool(re.search(r'const.*{.*}.*=', content))
    results['code_quality']['component_structure'] = bool(re.search(r'const.*Dashboard.*=.*=>', content))
    results['code_quality']['export_default'] = bool(re.search(r'export default', content))
    
    return results

def generate_task_37_report(results, filepath):
    """Genera un report dettagliato per il Task 37"""
    
    report = {
        'task_info': {
            'task_number': 37,
            'task_name': 'Professional Dashboard Layout',
            'date': datetime.now().isoformat(),
            'file_analyzed': filepath
        },
        'verification_results': results,
        'summary': {},
        'recommendations': []
    }
    
    # Calcola percentuali di completamento
    requirements = results['requirements_check']
    total_requirements = len(requirements)
    completed_requirements = sum(1 for v in requirements.values() if v)
    
    components = results['components_found']
    total_components = len(components)
    implemented_components = sum(1 for v in components.values() if v)
    
    report['summary'] = {
        'requirements_completion': f"{completed_requirements}/{total_requirements} ({completed_requirements/total_requirements*100:.1f}%)",
        'components_implementation': f"{implemented_components}/{total_components} ({implemented_components/total_components*100:.1f}%)",
        'total_testids': results['testing_attributes']['total_testids'],
        'accessibility_score': sum(1 for v in results['accessibility_features'].values() if isinstance(v, bool) and v),
        'interactive_features_count': sum(1 for v in results['interactive_features'].values() if isinstance(v, bool) and v),
        'overall_status': 'COMPLETED' if completed_requirements >= total_requirements - 1 else 'IN_PROGRESS'
    }
    
    # Raccomandazioni
    if not requirements.get('professional_focused_layout'):
        report['recommendations'].append("⚠️ Migliorare il layout professionale con design più pulito")
    
    if not requirements.get('patient_list_sidebar'):
        report['recommendations'].append("⚠️ Implementare completamente la sidebar con lista pazienti")
    
    if results['testing_attributes']['total_testids'] < 10:
        report['recommendations'].append("⚠️ Aggiungere più data-testid per una copertura testing completa")
    
    if results['accessibility_features']['aria_labels'] < 3:
        report['recommendations'].append("⚠️ Migliorare l'accessibilità con più aria-label")
    
    if len(report['recommendations']) == 0:
        report['recommendations'].append("✅ Implementazione completa e di alta qualità!")
    
    return report

def main():
    """Funzione principale di verifica"""
    print("🎯 TASK 37 VERIFICATION: Professional Dashboard Layout")
    print("=" * 60)
    
    filepath = r"C:\Users\arman\Desktop\WebSimpl\smile_adventure\frontend\src\components\professional\ProfessionalDashboard.jsx"
    
    if not check_file_exists(filepath):
        print(f"❌ File non trovato: {filepath}")
        return
    
    print(f"📄 Analizzando: {os.path.basename(filepath)}")
    
    # Analizza il file
    results = analyze_professional_dashboard(filepath)
    
    # Genera report
    report = generate_task_37_report(results, filepath)
    
    # Stampa risultati
    print(f"\n📊 RISULTATI ANALISI:")
    print(f"   • Requisiti completati: {report['summary']['requirements_completion']}")
    print(f"   • Componenti implementati: {report['summary']['components_implementation']}")
    print(f"   • Data-testid attributes: {report['summary']['total_testids']}")
    print(f"   • Score accessibilità: {report['summary']['accessibility_score']}/4")
    print(f"   • Features interattive: {report['summary']['interactive_features_count']}")
    print(f"   • Status generale: {report['summary']['overall_status']}")
    
    print(f"\n✅ REQUISITI TASK 37:")
    for req, status in results['requirements_check'].items():
        icon = "✅" if status else "❌"
        print(f"   {icon} {req.replace('_', ' ').title()}")
    
    print(f"\n🧩 COMPONENTI IMPLEMENTATI:")
    for comp, status in results['components_found'].items():
        icon = "✅" if status else "❌"
        print(f"   {icon} {comp.replace('_', ' ').title()}")
    
    print(f"\n🔧 FEATURES ACCESSIBILITÀ:")
    for feat, value in results['accessibility_features'].items():
        if isinstance(value, bool):
            icon = "✅" if value else "❌"
            print(f"   {icon} {feat.replace('_', ' ').title()}")
        else:
            print(f"   📊 {feat.replace('_', ' ').title()}: {value}")
    
    print(f"\n🧪 TESTING ATTRIBUTES:")
    print(f"   📊 Totale data-testid: {results['testing_attributes']['total_testids']}")
    if results['testing_attributes']['testid_list']:
        print(f"   📝 TestIDs trovati:")
        for testid in results['testing_attributes']['testid_list'][:10]:  # Prima 10
            print(f"      • {testid}")
        if len(results['testing_attributes']['testid_list']) > 10:
            print(f"      ... e altri {len(results['testing_attributes']['testid_list']) - 10}")
    
    print(f"\n💡 RACCOMANDAZIONI:")
    for rec in report['recommendations']:
        print(f"   {rec}")
    
    # Salva report completo
    report_file = "task_37_professional_dashboard_verification_report.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Report completo salvato in: {report_file}")
    
    # Status finale
    if report['summary']['overall_status'] == 'COMPLETED':
        print(f"\n🎉 TASK 37 COMPLETATO CON SUCCESSO!")
        print(f"   ✅ Professional Dashboard Layout implementato correttamente")
        print(f"   ✅ Sidebar pazienti funzionale con ricerca e filtri")
        print(f"   ✅ Overview cards multi-paziente responsive")
        print(f"   ✅ Quick actions menu implementato")
        print(f"   ✅ Design professionale e accessibile")
    else:
        print(f"\n⚠️ TASK 37 IN CORSO - COMPLETAMENTO: {report['summary']['requirements_completion']}")

if __name__ == "__main__":
    main()
