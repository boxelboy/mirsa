<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrderTemplate;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Work Order Template Controller
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class WorkOrderTemplateController extends Controller
{
    
    /**
     * List all Delivery Notes records for the selected SalesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function workOrdersFromTemplateAction()
    {
        return $this->render('MirsaMirsaBundle:WorkOrderTemplate:list.html.twig');
    }
    
    /* to build the filter from the request variables */
    public function buildFilterAction(Request $request)
    {
        /* Get the data that is POSTed from the html form  */ 
        $parameters = explode('_',$request->request->get('workOrderTemplate'));
        $workOrderTemplate = $parameters[0];
        $inspectionTemplateDescription = $parameters[1];
        
        $toDate = $request->request->get('toDate');
        $fromDate = $request->request->get('fromDate');
        $sku = $request->request->get('sku');

        $inspectionTemplate = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrderTemplate')
            ->createQueryBuilder('w')
            ->where('w.id = :templateid')
            ->setParameter('templateid', $workOrderTemplate)
            ->getQuery()
            ->getSingleResult();

        return $this->render(
            'MirsaMirsaBundle:WorkOrderTemplate:list.html.twig', array(
                'workOrderTemplate' => $workOrderTemplate,
                'inspectionTemplate' => $inspectionTemplate,
                'toDate' => $toDate,
                'fromDate' => $fromDate,
                'sku' => $sku
        ));
    }

    public function selectWorkOrderTemplateAction()
    {

        if (is_null($this->getUser()->getContact())) { 
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrderTemplate')
                ->createQueryBuilder('w')
                ->orderBy('w.templateName', 'ASC')
                ->getQuery()
                ->getResult();
        } else {
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrderTemplate')
                ->createQueryBuilder('w')
                ->where('w.customerAccountNumber = :can')
                ->setParameter('can', $this->getUser()->getContact()->getClient()->getId() )
                ->orderBy('w.templateName', 'ASC')
                ->getQuery()
                ->getResult();
        }

        return $this->render(
            'MirsaMirsaBundle:WorkOrderTemplate:select.html.twig',
            array('workOrderTemplates' => $qb)
        );
    }

    /* Used to read the stock when a Part Number is selected */
    public function getPartNumbersAction(Request $request)
    {
        $parameters = explode('_',$request->request->get('workOrderTemplate'));
        $workOrderTemplate = $parameters[0]; // no longer needed
        $inspectionTemplate = $parameters[1];
        
        $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:PartNumber')
            ->createQueryBuilder('p')
            ->where('p.customerAccountNumber = :can')
            ->setParameter('can', $inspectionTemplate)
            ->orderBy('p.sku', 'ASC')
            ->getQuery()
            ->getResult();

        $rows = array();
        foreach ($qb as $row) {
            $rows[] = array('sku' => $row->getSku(), 'description' => $row->getDescription());
        }

        return new JsonResponse(array('stock' => $rows));
    }

    /* Used to export the records, this will also work with the filters */
    public function exportAction(Request $request)
    {
        $sku = $request->query->get('sku');
        $fromDate = $request->query->get('fromDate');
        $toDate = $request->query->get('toDate');
        $workOrderTemplate = $request->query->get('workOrderTemplate');

        $response = new StreamedResponse();
        $response->setCallback(function() use (&$sku, &$fromDate, &$toDate, &$workOrderTemplate) {
            $fc = fopen('php://output', 'w+');
            $titles = array('WorkOrder Number', 'Description', 'Sku', 'Planned Start Date', 'Quantity Inspected' , 'Quantity Accepted', 'Quantity Rejected');
            $inspectionTemplate = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrderTemplate')
                ->createQueryBuilder('w')
                ->where('w.id = :templateid')
                ->setParameter('templateid', $workOrderTemplate)
                ->getQuery()
                ->getSingleResult();

            if ($inspectionTemplate->getCustomLabel1() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel1());
            }
            if ($inspectionTemplate->getCustomLabel2() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel2());
            }
            if ($inspectionTemplate->getCustomLabel3() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel3());
            }
            if ($inspectionTemplate->getCustomLabel4() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel4());
            }
            if ($inspectionTemplate->getCustomLabel5() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel5());
            }            
            if ($inspectionTemplate->getCustomLabel6() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel6());
            }
            if ($inspectionTemplate->getCustomLabel7() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel7());
            }
            if ($inspectionTemplate->getCustomLabel8() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel8());
            }
            if ($inspectionTemplate->getCustomLabel9() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel9());
            }
            if ($inspectionTemplate->getCustomLabel10() != "" ) {
                array_push($titles,$inspectionTemplate->getCustomLabel10());
            }
            
            fputcsv($fc, $titles,',');

            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrder');
            $qb = $qb->createQueryBuilder('wo');
            $qb = $qb->select('wo.id,wo.description,wo.sku,wo.plannedStartDate,wo.qtyInspected,wo.qtyAccepted,wo.qtyRejected,wo.customField1,wo.customField2,wo.customField3,wo.customField4,wo.customField5,wo.customField6,wo.customField7,wo.customField8,wo.customField9,wo.customField10');

            if ($sku != "") {
                if ($sku != "all") {  
                    $qb = $qb->andWhere('LOWER(wo.sku) LIKE :sku');
                    $qb = $qb->setParameter('sku', '%' . strtolower($sku) . '%');
                    }
            }
            if ($workOrderTemplate != "") {
                $qb = $qb->andWhere('wo.inspectionId = :workOrderTemplate');
                $qb = $qb->setParameter('workOrderTemplate', $workOrderTemplate);
            }
            if ($fromDate != "" ) {
                $qb = $qb->andWhere('wo.plannedStartDate >= :fromDate');
                $qb = $qb->setParameter('fromDate', \DateTime::createFromFormat('m/d/Y', $fromDate), 'date');
            }
            if ($toDate != "" ) {
                $qb = $qb->andWhere('wo.plannedStartDate <= :toDate');
                $qb = $qb->setParameter('toDate', \DateTime::createFromFormat('m/d/Y', $toDate), 'date');
            }

            /* Only export the items for the currently logged in client*/
            if (!is_null($this->getUser()->getContact())) { 
                if ($this->getUser()->getContact()->getClient()) {
                    $qb = $qb->andWhere('wo.client = :client');
                    $qb = $qb->setParameter('client', $this->getUser()->getContact()->getClient());
                }
            }

            $qb = $qb->getQuery();
            $crossTabDefect = $qb->getResult();

            foreach ($crossTabDefect as $item)
            {
                if (is_null($item['plannedStartDate'])) {
                    $startDate = "";
                } else {
                    $startDate = date_format($item['plannedStartDate'], "m-d-Y");
                }

                $data = array($item['id'],$item['description'],$item['sku'],$startDate,$item['qtyInspected'],$item['qtyAccepted'],$item['qtyRejected']);

                if ($inspectionTemplate->getCustomLabel1() != "" ) {
                    array_push($data,$item['customField1']);
                }
                if ($inspectionTemplate->getCustomLabel2() != "" ) {
                    array_push($data,$item['customField2']);
                }
                if ($inspectionTemplate->getCustomLabel3() != "" ) {
                    array_push($data,$item['customField3']);
                }
                if ($inspectionTemplate->getCustomLabel4() != "" ) {
                    array_push($data,$item['customField4']);
                }
                if ($inspectionTemplate->getCustomLabel5() != "" ) {
                    array_push($data,$item['customField5']);
                }
                if ($inspectionTemplate->getCustomLabel6() != "" ) {
                    array_push($data,$item['customField6']);
                }
                if ($inspectionTemplate->getCustomLabel7() != "" ) {
                    array_push($data,$item['customField7']);
                }
                if ($inspectionTemplate->getCustomLabel8() != "" ) {
                    array_push($data,$item['customField8']);
                }
                if ($inspectionTemplate->getCustomLabel9() != "" ) {
                    array_push($data,$item['customField9']);
                }
                if ($inspectionTemplate->getCustomLabel10() != "" ) {
                    array_push($data,$item['customField10']);
                }

                fputcsv($fc, $data,',');
            }
            fclose($fc);
        });
        $filename = "cross_tab_defect_export_".date("m_d_Y_His").".csv";
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename=' . $filename);
        return $response;
    }
}
