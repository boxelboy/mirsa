<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrderInspectionLineItem;

/**
 * WorkOrderInspectionLineItemController
 *
 * @author cps
 * @link   
 */
class WorkOrderInspectionLineItemController extends Controller
{
    
    protected $workOrder;
    
    /**
     * List all Work Order inspection Line Items records for the selected SalesOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     */
    public function inspectionLineItemsFromWorkOrderAction(WorkOrder $workOrder)
    {
        return $this->render('MirsaMirsaBundle:WorkOrderInspectionLineItem:list.html.twig', array('workOrder' => $workOrder));
    }
    
    /**
     * Only fetch delivery notes associated with the selected sales order
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        $qb->andWhere($alias . '.salesOrder = :salesorder');
        $qb->setParameter('salesorder',$this->salesOrder->getId());

        return $qb;
    }        
    
    

    /**
     * View a Delivery Note PDF
     *
     * @param DeliveryNote $deliveryNote
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function downloadAction(DeliveryNote $deliveryNote)
    {
        $containerUrl = $deliveryNote->getPdf()->getUrl();
        
        $url = sprintf(
            '%s://%s:%s/%s',
            $this->container->getParameter('businessman.protocol'),
            $this->container->getParameter('businessman.host'),
            $this->container->getParameter('businessman.port'),
            $containerUrl
        );

        try {
            return new Response(file_get_contents($url), 200, array('Content-Type' => 'application/pdf'));
        } catch (\Exception $e) {
            throw $this->createNotFoundException();
        }
    }

    public function downloadCSVAction(WorkOrder $workOrder)
    {
        $response = new StreamedResponse();
        $response->setCallback(function() use (&$workOrder) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('Date Inspected', 'Batch No', 'Serial No', 'Mfg Date', 'Qty Inspected', 'Qty Rejected', 'Qty Reworked', 'Qty Accepted', 'Description'),',');
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:WorkOrderInspectionLineItem')
                ->createQueryBuilder('woili')
                ->select('woili.dateInspected,woili.batchNo,woili.serialNo,woili.manufacturedDate,woili.qtyInspected,woili.qtyRejected,woili.qtyReworked,woili.qtyAccepted,woili.description')
                ->where('woili.workOrder = :wo')
                ->setParameter('wo', $workOrder->getId())
                ->getQuery();
            $me = $qb->getResult();
            foreach ($me as $item)
            {
                foreach ($item as $k => $v)
                {
                    if ($k != 'dateInspected') {if (is_null($v)) {$item[$k] = "";}}
                }
                if ($item['dateInspected'] == null)
                {
                    $newDate = "";
                }
                else
                {
                    $newDate = date_format($item['dateInspected'], "m-d-Y");
                }

                fputcsv($fc, array($newDate,
                                   $item['batchNo'],
                                   $item['serialNo'],
                                   $item['manufacturedDate'],
                                   $item['qtyInspected'],
                                   $item['qtyRejected'],
                                   $item['qtyReworked'],
                                   $item['qtyAccepted'],
                                   $item['description']),
                        ',');
            }
            fclose($fc);
        });
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename="export.csv"');
    
        return $response;
    }
    

}