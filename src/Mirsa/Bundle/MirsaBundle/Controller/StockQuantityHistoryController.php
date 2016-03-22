<?php
namespace Mirsa\Bundle\MirsaBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Mirsa\Bundle\MirsaBundle\Entity\StockQuantityHistory;
use Mirsa\Bundle\MirsaBundle\Entity\WorkOrder;

/**
 * StockQuantityHistoryController
 *
 * @author cps
 * @link   
 */
class StockQuantityHistoryController extends Controller
{
    
    protected $workOrder;
    protected $id;
    
    /**
     * List all Timesheet records for the selected WorkOrder
     *
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @Cache(public=true, smaxage=86400, maxage=86400, vary={"Cookie"})
     * @Security("has_role('ROLE_STAFF')")
     */
    public function assemblyFromWorkOrderAction(WorkOrder $workOrder)
    {
        return $this->render('MirsaMirsaBundle:WorkOrderAssembly:list.html.twig', array('workOrder' => $workOrder));
    }

    public function assemblyDownloadAction(WorkOrder $workOrder)
    {
        $response = new StreamedResponse();
        $response->setCallback(function() use (&$workOrder) {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('Quantity', 'Serial No', 'Batch No', 'SKU Code', 'Description', 'Trading Company', 'Warehouse', 'Aisle', 'Bay Name', 'Cost'),',');
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:StockQuantityHistory')
                ->createQueryBuilder('cps')
                ->select('cps.quantity,cps.serialNo,cps.batchNo,cps.sku,cps.description,cps.companyName,cps.warehouseName,cps.aisleName,cps.bayName,cps.cost')
                ->where('cps.workOrder = :wo')
                ->setParameter('wo', $workOrder->getId())
                ->getQuery();
            $me = $qb->getResult();
            foreach ($me as $item)
            {
                fputcsv($fc, array($item['quantity'],
                                   $item['serialNo'],
                                   $item['batchNo'],
                                   $item['sku'],
                                   $item['description'],
                                   $item['companyName'],
                                   $item['warehouseName'],
                                   $item['aisleName'],
                                   $item['bayName'],
                                   $item['cost']),
                         ',');
            }
            fclose($fc);
        });
        $response->setStatusCode(200);
        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition','attachment; filename="export.csv"');
        return $response;
    }
    
    /**
     * Only fetch stock history associated with the selected work order
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        
        $qb->andWhere($alias . '.workOrder = :workorder');
        $qb->setParameter('workorder',$this->workOrder->getId());

        return $qb;
    }        

}