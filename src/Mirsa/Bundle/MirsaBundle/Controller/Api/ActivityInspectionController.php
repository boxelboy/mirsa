<?php
namespace Mirsa\Bundle\MirsaBundle\Controller\Api;

use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Computech\Bundle\CommonBundle\Controller\AbstractRestController;

/**
 * ActivityInspectionController
 *
 * @author cps
 * @link   http://git.computech-it.co.uk/businessmanportal/JobBundle
 */
class ActivityInspectionController extends AbstractRestController
{
    /**
     * {@inheritDoc}
     */
    public function listAction(Request $request, $_format)
    {
        return parent::listAction($request, $_format);
    }

    /**
     * {@inheritDoc}
     */
    protected function getSummaryColumnNames() {
        return array('e.qtyInspected', 'e.qtyRejected');
    }

    /**
     * {@inheritDoc}
     */
    protected function getEntityName()
    {
        return 'MirsaMirsaBundle:ActivityInspection';
    }

   /**
     * Only fetch Inspection Work Orders records associated with the selected stock record
     *
     * @param string $alias
     *
     * @return \Doctrine\ORM\QueryBuilder
     */
    protected function getQueryBuilder($alias)
    {
        $qb = parent::getQueryBuilder($alias);
        $qb->andWhere($alias . '.type IN (:defaultType)');
        $qb->setParameter('defaultType', array('Internal Inspection', 'Inspection', 'External Inspection'));
        
        if (!is_null($this->getUser()->getContact())) { 
            if ($this->getUser()->getContact()->getClient()) {
                $qb->andWhere($alias . '.client = :client');
                $qb->setParameter('client', $this->getUser()->getContact()->getClient());
            }
        }
        return $qb;
    }

    public function exportAction()
    {
        $response = new StreamedResponse();
        $response->setCallback(function() {
            $fc = fopen('php://output', 'w+');
            fputcsv($fc, array('#', 'Created', 'Part No.', 'Type', 'Qty', 'Qty Built', 'Qty Quar', 'PPM', 'EFF %','Planned Start', 'Planned End','% Comp', 'Status', 'SO No', 'Customer Name', 'Trading Company'),',');
            $qb = $this->getDoctrine()->getRepository('MirsaMirsaBundle:ActivityInspection')
                ->createQueryBuilder('ai')
                ->select('ai.id,ai.created,ai.sku,ai.totalJobCosts,ai.totalTimesheetNormalHours,ai.totalTimesheetOvertimeHours,ai.qtyInspected,ai.qtyRejected,ai.type,ai.plannedStartDate,ai.plannedEndDate,ai.scheduleRequired,ai.assemblyStatus,ai.salesOrderNumber,ai.customerName,ai.tradingCompany')
                ->getQuery();
            $me = $qb->getResult();
            foreach ($me as $item)
            {
                if (is_null($item['created']))
                {
                    $createdDate = "";
                }
                else
                {
                    $createdDate = date_format($item['created'], "m-d-Y");
                }                
                if (is_null($item['plannedStartDate']))
                {
                    $startDate = "";
                }
                else
                {
                    $startDate = date_format($item['plannedStartDate'], "m-d-Y");
                }
                if (is_null($item['plannedEndDate']))
                {
                    $endDate = "";
                }
                else
                {
                    $endDate = date_format($item['plannedEndDate'], "m-d-Y");
                }

                fputcsv($fc, array($item['id'],
                                   $createdDate,
                                   $item['sku'],
                                   $item['type'],
                                   $item['assemblyQty'],
                                   $item['assemblyQtyCompleted'],
                                   $item['assemblyQtyQuarantined'],
                                   $item['ppmLevel'],
                                   $item['ppmEfficiency'],
                                   $startDate,
                                   $endDate,
                                   $item['jobProgressPercent'],
                                   $item['assemblyStatus'],
                                   $item['salesOrderNumber'],
                                   $item['customerName'],
                                   $item['tradingCompany']),
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